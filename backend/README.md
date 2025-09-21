Run locally:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

## LLM Observability and Best Practices

All interactions with Large Language Models (LLMs) within this backend are routed through the centralized `app.llm.client.LLMClient`. This client provides:

-   **Centralized Logging:** All LLM calls (inputs, outputs, models, providers, and associated context) are automatically logged to `backend/data/logs/llm_calls.jsonl` in a structured JSONL format. This enables comprehensive observability and debugging.
-   **Rate Limiting and Caching:** The client handles rate limiting and caching to optimize performance and cost.

**Best Practice:** When making LLM calls from any agent or service within the backend, always import and use the `app.llm.client.client` instance. Avoid direct calls to LLM provider SDKs (e.g., `openai`, `anthropic`, `google.generativeai`) to ensure all interactions are logged and managed centrally. When calling `client.generate` or `client.stream`, consider passing a `context` dictionary (e.g., `context={"agent": "AgentName", "method": "method_name"}`) to enrich the logs with valuable metadata about the call's origin.
