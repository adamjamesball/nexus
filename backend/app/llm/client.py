"""
Unified LLM client interface with rate limiting and caching
"""
import asyncio
import hashlib
import json
import logging
import json
import os
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime, timedelta
# import redis.asyncio as redis  # Disabled for simplified testing
# from slowapi import Limiter, _rate_limit_exceeded_handler  # Disabled
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded

from .gateway import gateway, LLMMessage, LLMResponse
from ..config import get_settings


logger = logging.getLogger(__name__)

# Setup a dedicated logger for LLM calls
LLM_CALL_LOGGER = logging.getLogger("llm_calls")
LLM_CALL_LOGGER.setLevel(logging.INFO)

# Ensure the log directory exists
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "logs")
os.makedirs(log_dir, exist_ok=True)

llm_call_handler = logging.FileHandler(os.path.join(log_dir, "llm_calls.jsonl"))
llm_call_handler.setFormatter(logging.Formatter("%(message)s"))
LLM_CALL_LOGGER.addHandler(llm_call_handler)


class RateLimitError(Exception):
    """Rate limit exceeded error"""
    pass


class LLMClient:
    """
    Unified LLM client with rate limiting, caching, and retry logic
    """

    def __init__(self):
        self.settings = get_settings()
        self._redis_client: Optional[Any] = None  # Disabled for simplified testing
        self._rate_limits: Dict[str, List[datetime]] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the client and its dependencies"""
        if self._initialized:
            return

        # Refresh settings to honour any environment overrides (e.g., test harness enabling mocks)
        self.settings = get_settings()

        # Initialize the gateway
        await gateway.initialize()

        # Initialize Redis client for caching - disabled for simplified testing
        # try:
        #     self._redis_client = redis.from_url(
        #         self.settings.redis_url,
        #         password=self.settings.redis_password,
        #         decode_responses=True
        #     )
        #     await self._redis_client.ping()
        #     logger.info("Redis client initialized for LLM caching")
        # except Exception as e:
        #     logger.warning(f"Redis unavailable, caching disabled: {e}")
        self._redis_client = None

        self._initialized = True

    def _generate_cache_key(
        self,
        messages: List[LLMMessage],
        provider: str,
        model: str,
        **kwargs
    ) -> str:
        """Generate a cache key for the request"""
        # Create a deterministic hash of the request parameters
        cache_data = {
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "provider": provider,
            "model": model,
            **kwargs
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return f"llm_cache:{hashlib.md5(cache_string.encode()).hexdigest()}"

    async def _check_cache(self, cache_key: str) -> Optional[LLMResponse]:
        """Check if response is cached"""
        if not self._redis_client:
            return None

        try:
            cached_data = await self._redis_client.get(cache_key)
            if cached_data:
                data = json.loads(cached_data)
                return LLMResponse(
                    content=data["content"],
                    provider=data["provider"],
                    model=data["model"],
                    usage=data.get("usage"),
                    finish_reason=data.get("finish_reason")
                )
        except Exception as e:
            logger.warning(f"Cache read error: {e}")

        return None

    async def _set_cache(
        self,
        cache_key: str,
        response: LLMResponse,
        ttl_seconds: int = 3600
    ) -> None:
        """Cache the response"""
        if not self._redis_client:
            return

        try:
            cache_data = {
                "content": response.content,
                "provider": response.provider,
                "model": response.model,
                "usage": response.usage,
                "finish_reason": response.finish_reason,
                "cached_at": datetime.utcnow().isoformat()
            }
            await self._redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(cache_data)
            )
        except Exception as e:
            logger.warning(f"Cache write error: {e}")

    def _check_rate_limit(self, provider: str) -> bool:
        """Check if rate limit allows the request"""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.settings.api_rate_window)

        if provider not in self._rate_limits:
            self._rate_limits[provider] = []

        # Clean old requests outside the window
        self._rate_limits[provider] = [
            req_time for req_time in self._rate_limits[provider]
            if req_time > window_start
        ]

        # Check if we're at the limit
        if len(self._rate_limits[provider]) >= self.settings.api_rate_limit:
            return False

        # Add current request
        self._rate_limits[provider].append(now)
        return True

    async def _retry_with_backoff(
        self,
        func,
        max_retries: int = 3,
        base_delay: float = 1.0,
        *args,
        **kwargs
    ):
        """Retry function with exponential backoff"""
        for attempt in range(max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e

                delay = base_delay * (2 ** attempt)
                logger.warning(f"Request failed (attempt {attempt + 1}/{max_retries}), retrying in {delay}s: {e}")
                await asyncio.sleep(delay)

    async def generate(
        self,
        messages: List[LLMMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        use_cache: bool = True,
        cache_ttl: int = 3600,
        **kwargs
    ) -> LLMResponse:
        """
        Generate response with rate limiting and caching

        Args:
            messages: List of messages for the conversation
            provider: LLM provider to use (defaults to configured default)
            model: Model to use (defaults to configured default)
            max_tokens: Maximum tokens to generate
            temperature: Temperature for generation
            use_cache: Whether to use caching
            cache_ttl: Cache time-to-live in seconds
            **kwargs: Additional arguments passed to the provider
        """
        if not self._initialized:
            await self.initialize()

        # Use defaults if not specified
        if not provider:
            provider = self.settings.default_llm_provider
        if not model:
            model = self.settings.default_model

        # Check rate limit
        if not self._check_rate_limit(provider):
            raise RateLimitError(f"Rate limit exceeded for provider {provider}")

        # Check cache first
        cache_key = None
        if use_cache:
            cache_key = self._generate_cache_key(messages, provider, model, **kwargs)
            cached_response = await self._check_cache(cache_key)
            if cached_response:
                logger.debug(f"Cache hit for {provider}:{model}")
                return cached_response

        # Generate response with retry logic
        try:
            response = await self._retry_with_backoff(
                gateway.generate,
                messages=messages,
                provider=provider,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )

            # Cache the response
            if use_cache and cache_key:
                await self._set_cache(cache_key, response, cache_ttl)

            # Log the LLM call
            LLM_CALL_LOGGER.info(json.dumps({
                "timestamp": datetime.utcnow().isoformat(),
                "provider": provider,
                "model": model,
                "input_messages": [msg.model_dump() for msg in messages],
                "output_content": response.content,
                "usage": response.usage.model_dump() if response.usage else None,
                "finish_reason": response.finish_reason,
            }))

            return response

        except Exception as e:
            logger.error(f"LLM generation failed for {provider}:{model}: {e}")
            raise

    async def stream(
        self,
        messages: List[LLMMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Stream response with rate limiting (no caching for streaming)
        """
        if not self._initialized:
            await self.initialize()

        # Use defaults if not specified
        if not provider:
            provider = self.settings.default_llm_provider
        if not model:
            model = self.settings.default_model

        # Check rate limit
        if not self._check_rate_limit(provider):
            raise RateLimitError(f"Rate limit exceeded for provider {provider}")

        try:
            async for chunk in gateway.stream(
                messages=messages,
                provider=provider,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            ):
                yield chunk
        except Exception as e:
            logger.error(f"LLM streaming failed for {provider}:{model}: {e}")
            raise

    async def get_available_providers(self) -> List[str]:
        """Get list of available providers"""
        if not self._initialized:
            await self.initialize()
        return gateway.get_available_providers()

    async def health_check(self) -> Dict[str, Any]:
        """Check health of all providers"""
        if not self._initialized:
            await self.initialize()

        health_status = {
            "gateway_initialized": True,
            "redis_available": self._redis_client is not None,
            "providers": {}
        }

        # Test each provider with a simple request
        test_messages = [LLMMessage(role="user", content="Hello")]

        for provider in gateway.get_available_providers():
            try:
                # Try a very short generation
                response = await gateway.generate(
                    messages=test_messages,
                    provider=provider,
                    max_tokens=10,
                    temperature=0.1
                )
                health_status["providers"][provider] = {
                    "status": "healthy",
                    "model_used": response.model,
                    "response_length": len(response.content)
                }
            except Exception as e:
                health_status["providers"][provider] = {
                    "status": "unhealthy",
                    "error": str(e)
                }

        return health_status


# Global client instance
client = LLMClient()
