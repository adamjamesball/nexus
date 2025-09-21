#!/usr/bin/env python3
"""
Direct test of Ollama client to verify it works outside the application
"""
import asyncio
import httpx


async def test_ollama_direct():
    """Test Ollama API directly without the application framework"""
    api_url = "http://localhost:11434/v1/chat/completions"
    model = "llama3.2:latest"

    print(f"Testing Ollama at {api_url} with model {model}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Hello, can you confirm you're working?"}],
            "max_tokens": 50,
            "temperature": 0.7,
            "stream": False
        }

        try:
            response = await client.post(
                api_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()

            data = response.json()
            print("✅ Ollama API call successful!")
            print(f"Response: {data['choices'][0]['message']['content']}")
            print(f"Model used: {data['model']}")
            print(f"Usage: {data.get('usage', 'N/A')}")

        except Exception as e:
            print(f"❌ Ollama API call failed: {e}")
            if hasattr(e, 'response'):
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")


if __name__ == "__main__":
    asyncio.run(test_ollama_direct())