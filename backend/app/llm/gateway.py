"""
Multi-provider LLM Gateway for Nexus
Supports OpenAI, Anthropic, and Google AI models
"""
import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, AsyncGenerator
from dataclasses import dataclass
from enum import Enum

import openai
import anthropic
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from ..config import get_settings


logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OLLAMA = "ollama"
    MOCK = "mock"


@dataclass
class LLMMessage:
    """Standardized message format across providers"""
    role: str  # "user", "assistant", "system"
    content: str


@dataclass
class LLMResponse:
    """Standardized response format across providers"""
    content: str
    provider: str
    model: str
    usage: Optional[Dict[str, int]] = None
    finish_reason: Optional[str] = None


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = None

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the client"""
        pass

    @abstractmethod
    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        """Generate a response from the model"""
        pass

    @abstractmethod
    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream response from the model"""
        pass


class OpenAIClient(BaseLLMClient):
    """OpenAI client implementation"""

    async def initialize(self) -> None:
        self._client = openai.AsyncOpenAI(api_key=self.api_key)

    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        openai_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        try:
            response = await self._client.chat.completions.create(
                model=model,
                messages=openai_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )

            return LLMResponse(
                content=response.choices[0].message.content,
                provider="openai",
                model=model,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                finish_reason=response.choices[0].finish_reason
            )
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        openai_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        try:
            stream = await self._client.chat.completions.create(
                model=model,
                messages=openai_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
                **kwargs
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"OpenAI streaming error: {e}")
            raise


class AnthropicClient(BaseLLMClient):
    """Anthropic client implementation"""

    async def initialize(self) -> None:
        self._client = anthropic.AsyncAnthropic(api_key=self.api_key)

    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        # Convert messages to Anthropic format
        system_messages = [msg.content for msg in messages if msg.role == "system"]
        user_messages = [msg for msg in messages if msg.role != "system"]

        anthropic_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in user_messages
        ]

        system_prompt = "\n".join(system_messages) if system_messages else None

        try:
            response = await self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=anthropic_messages,
                **kwargs
            )

            return LLMResponse(
                content=response.content[0].text,
                provider="anthropic",
                model=model,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
                },
                finish_reason=response.stop_reason
            )
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise

    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        system_messages = [msg.content for msg in messages if msg.role == "system"]
        user_messages = [msg for msg in messages if msg.role != "system"]

        anthropic_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in user_messages
        ]

        system_prompt = "\n".join(system_messages) if system_messages else None

        try:
            stream = await self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=anthropic_messages,
                stream=True,
                **kwargs
            )

            async for chunk in stream:
                if chunk.type == "content_block_delta" and chunk.delta.type == "text_delta":
                    yield chunk.delta.text
        except Exception as e:
            logger.error(f"Anthropic streaming error: {e}")
            raise


class OllamaClient(BaseLLMClient):
    """Ollama local LLM client implementation"""

    def __init__(self, api_url: str, model: str):
        self.api_url = api_url
        self.model = model
        self._client = None

    async def initialize(self) -> None:
        import httpx
        self._client = httpx.AsyncClient(timeout=120.0)  # Longer timeout for local inference

    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        # Convert to OpenAI-compatible format (Ollama uses OpenAI API format)
        openai_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        try:
            payload = {
                "model": self.model,
                "messages": openai_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False,
                **kwargs
            }

            response = await self._client.post(
                self.api_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            data = response.json()

            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                provider="ollama",
                model=self.model,
                usage={
                    "prompt_tokens": data.get("usage", {}).get("prompt_tokens", 0),
                    "completion_tokens": data.get("usage", {}).get("completion_tokens", 0),
                    "total_tokens": data.get("usage", {}).get("total_tokens", 0),
                },
                finish_reason=data["choices"][0].get("finish_reason")
            )
        except Exception as e:
            logger.error(f"Ollama API error: {e}")
            raise

    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        openai_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        try:
            payload = {
                "model": self.model,
                "messages": openai_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": True,
                **kwargs
            }

            async with self._client.stream(
                "POST",
                self.api_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove "data: " prefix
                        if data_str == "[DONE]":
                            break

                        try:
                            import json
                            data = json.loads(data_str)
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Ollama streaming error: {e}")
            raise


class GoogleClient(BaseLLMClient):
    """Google AI client implementation"""

    async def initialize(self) -> None:
        genai.configure(api_key=self.api_key)

    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        # Convert messages to Google format
        google_messages = []
        for msg in messages:
            if msg.role == "system":
                # System messages are handled differently in Google AI
                continue
            role = "user" if msg.role == "user" else "model"
            google_messages.append({"role": role, "parts": [msg.content]})

        try:
            model_instance = genai.GenerativeModel(model)

            # Configure safety settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }

            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )

            # Create chat or generate content based on message structure
            if len(google_messages) > 1:
                chat = model_instance.start_chat(history=google_messages[:-1])
                response = await chat.send_message_async(
                    google_messages[-1]["parts"][0],
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
            else:
                response = await model_instance.generate_content_async(
                    google_messages[0]["parts"][0],
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )

            return LLMResponse(
                content=response.text,
                provider="google",
                model=model,
                usage={
                    "prompt_tokens": response.usage_metadata.prompt_token_count,
                    "completion_tokens": response.usage_metadata.candidates_token_count,
                    "total_tokens": response.usage_metadata.total_token_count,
                },
                finish_reason=str(response.candidates[0].finish_reason) if response.candidates else None
            )
        except Exception as e:
            logger.error(f"Google AI API error: {e}")
            raise

    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        # Similar to generate but with streaming
        google_messages = []
        for msg in messages:
            if msg.role == "system":
                continue
            role = "user" if msg.role == "user" else "model"
            google_messages.append({"role": role, "parts": [msg.content]})

        try:
            model_instance = genai.GenerativeModel(model)

            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )

            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }

            if len(google_messages) > 1:
                chat = model_instance.start_chat(history=google_messages[:-1])
                response = await chat.send_message_async(
                    google_messages[-1]["parts"][0],
                    generation_config=generation_config,
                    safety_settings=safety_settings,
                    stream=True
                )
            else:
                response = await model_instance.generate_content_async(
                    google_messages[0]["parts"][0],
                    generation_config=generation_config,
                    safety_settings=safety_settings,
                    stream=True
                )

            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Google AI streaming error: {e}")
            raise


class MockLLMClient(BaseLLMClient):
    """Deterministic mock client for offline testing"""

    def __init__(self):
        super().__init__(api_key="mock")

    async def initialize(self) -> None:
        self._client = True

    async def generate(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        prompt = messages[-1].content if messages else ""
        snippet = prompt.strip().splitlines()[0][:120]
        content = f"[mock:{model}] Response synthesized for '{snippet}'"
        return LLMResponse(
            content=content,
            provider="mock",
            model=model or "mock-sim",
            usage={"prompt_tokens": len(prompt.split()), "completion_tokens": len(content.split()), "total_tokens": len(prompt.split()) + len(content.split())},
            finish_reason="stop",
        )

    async def stream(
        self,
        messages: List[LLMMessage],
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        response = await self.generate(messages, model, max_tokens=max_tokens, temperature=temperature, **kwargs)
        yield response.content


class LLMGateway:
    """Central gateway for managing multiple LLM providers"""

    def __init__(self):
        self.settings = get_settings()
        self._clients: Dict[str, BaseLLMClient] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize all available LLM clients"""
        if self._initialized:
            return

        # Refresh settings in case environment toggles between test and production contexts
        self.settings = get_settings()

        logger.info("🔄 Starting LLM Gateway initialization...")
        logger.info(f"Settings - ollama_api_url: {getattr(self.settings, 'ollama_api_url', 'NOT_SET')}")
        logger.info(f"Settings - default_llm_provider: {self.settings.default_llm_provider}")
        logger.info(f"Settings - default_model: {self.settings.default_model}")
        logger.info(f"Settings - enable_mock_llm: {self.settings.enable_mock_llm}")

        # Initialize OpenAI client
        if self.settings.openai_api_key:
            self._clients["openai"] = OpenAIClient(self.settings.openai_api_key)
            await self._clients["openai"].initialize()
            logger.info("OpenAI client initialized")

        # Initialize Anthropic client
        if self.settings.anthropic_api_key:
            self._clients["anthropic"] = AnthropicClient(self.settings.anthropic_api_key)
            await self._clients["anthropic"].initialize()
            logger.info("Anthropic client initialized")

        # Initialize Google client
        if self.settings.google_api_key:
            self._clients["google"] = GoogleClient(self.settings.google_api_key)
            await self._clients["google"].initialize()
            logger.info("Google AI client initialized")

        # Initialize Ollama client with better error handling
        if hasattr(self.settings, 'ollama_api_url') and self.settings.ollama_api_url:
            try:
                ollama_model = getattr(self.settings, 'ollama_model', None) or self.settings.default_model
                logger.info(f"Attempting to initialize Ollama with URL: {self.settings.ollama_api_url}, model: {ollama_model}")
                self._clients["ollama"] = OllamaClient(
                    self.settings.ollama_api_url,
                    ollama_model
                )
                await self._clients["ollama"].initialize()
                logger.info("Ollama client basic initialization successful")

                # Test ollama availability with a simple request
                test_messages = [LLMMessage(role="user", content="Hello")]
                try:
                    logger.info(f"Testing Ollama with model: {ollama_model}")
                    await self._clients["ollama"].generate(test_messages, ollama_model, max_tokens=5)
                    logger.info(f"Ollama client initialized and tested successfully with model: {ollama_model}")
                except Exception as test_error:
                    logger.error(f"Ollama model '{ollama_model}' test failed: {test_error}. Keeping provider for debugging.")
                    # Temporarily disable removal to see if it works without testing
                    # del self._clients["ollama"]

            except Exception as e:
                logger.error(f"Ollama initialization failed: {e}. Skipping Ollama provider.")
        else:
            logger.warning(f"Ollama not configured: ollama_api_url={getattr(self.settings, 'ollama_api_url', None)}")

        if self.settings.enable_mock_llm:
            if "mock" not in self._clients:
                mock_client = MockLLMClient()
                await mock_client.initialize()
                self._clients["mock"] = mock_client
        if not self._clients:
            raise RuntimeError(
                "No LLM providers are configured. Provide API keys or explicitly enable mocks for testing."
            )
        if self.settings.default_llm_provider not in self._clients:
            # Fall back to the first available provider
            self.settings.default_llm_provider = next(iter(self._clients))

        self._initialized = True
        logger.info(f"LLM Gateway initialized with providers: {list(self._clients.keys())}")

    def get_available_providers(self) -> List[str]:
        """Get list of available providers"""
        return list(self._clients.keys())

    async def generate(
        self,
        messages: List[LLMMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> LLMResponse:
        """Generate response using specified or default provider"""
        if not self._initialized:
            await self.initialize()

        # Use default provider if not specified
        if not provider:
            provider = self.settings.default_llm_provider

        if provider not in self._clients:
            if self._clients:
                provider = next(iter(self._clients))
            else:
                raise ValueError("No LLM providers are initialized")

        # Use default model if not specified
        if not model:
            model = self.settings.default_model

        if provider not in self._clients:
            raise ValueError(f"Provider {provider} not available. Available: {list(self._clients.keys())}")

        client = self._clients[provider]
        return await client.generate(messages, model, max_tokens, temperature, **kwargs)

    async def stream(
        self,
        messages: List[LLMMessage],
        provider: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream response using specified or default provider"""
        if not self._initialized:
            await self.initialize()

        # Use default provider if not specified
        if not provider:
            provider = self.settings.default_llm_provider

        if provider not in self._clients:
            if self._clients:
                provider = next(iter(self._clients))
            else:
                raise ValueError("No LLM providers are initialized")

        # Use default model if not specified
        if not model:
            model = self.settings.default_model

        client = self._clients[provider]
        async for chunk in client.stream(messages, model, max_tokens, temperature, **kwargs):
            yield chunk


# Global gateway instance
gateway = LLMGateway()
