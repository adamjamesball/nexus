"""
Unit tests for LLM system components
Test-Engineer Agent Implementation
"""

import os
import pytest
import asyncio
import sys
from pathlib import Path

# Ensure tests run with deterministic mock LLM (production should keep this disabled)
os.environ.setdefault("ENABLE_MOCK_LLM", "true")

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import get_settings

# Clear cached settings so ENABLE_MOCK_LLM is respected within the test context
get_settings.cache_clear()

from app.llm import client, gateway, LLMMessage


class TestLLMSystem:
    """Unit tests for LLM system components"""

    @pytest.mark.asyncio
    async def test_client_initialization(self):
        """Test LLM client initialization"""
        await client.initialize()
        assert client._initialized is True

    @pytest.mark.asyncio
    async def test_gateway_initialization(self):
        """Test LLM gateway initialization"""
        await gateway.initialize()
        assert gateway._initialized is True
        assert len(gateway._clients) > 0

    @pytest.mark.asyncio
    async def test_provider_availability(self):
        """Test that at least one LLM provider is available"""
        providers = await client.get_available_providers()
        assert len(providers) > 0, "No LLM providers available"

    @pytest.mark.asyncio
    async def test_health_check(self):
        """Test LLM system health check"""
        health = await client.health_check()
        assert "providers" in health
        assert health["gateway_initialized"] is True

        # Check that at least one provider is healthy
        healthy_providers = [
            p for p, status in health["providers"].items()
            if status.get("status") == "healthy"
        ]
        assert len(healthy_providers) > 0, "No healthy LLM providers found"

    @pytest.mark.asyncio
    async def test_simple_generation(self):
        """Test basic LLM text generation"""
        messages = [LLMMessage(role="user", content="Say hello")]

        response = await client.generate(
            messages=messages,
            max_tokens=10,
            temperature=0.1
        )

        assert response is not None
        assert response.content
        assert len(response.content) > 0
        providers = await client.get_available_providers()
        assert response.provider in providers

    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test LLM error handling for invalid requests"""
        with pytest.raises(Exception):
            # Test with empty messages
            await client.generate(messages=[], max_tokens=10)

    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test rate limiting functionality"""
        # This test would need to be implemented based on specific rate limiting logic
        # For now, just ensure the rate limit check method exists
        assert hasattr(client, '_check_rate_limit')


if __name__ == "__main__":
    asyncio.run(pytest.main([__file__, "-v"]))
