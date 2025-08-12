# Nexus: The World's Most Advanced Agentic AI Platform for Sustainability

This repo now includes a minimal runnable multi-agent backend (FastAPI) and an MVP frontend (Next.js) wired to it.

Quick start:

```bash
# Backend (local)
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000

# Frontend (in another terminal)
cd frontend
cp .env.local.sample .env.local
npm install
npm run dev
```

Or via Docker Compose:

```bash
docker compose up --build
```

Backend endpoints:
- GET /health
- POST /sessions → { session_id }
- POST /sessions/{id}/files (multipart)
- POST /sessions/{id}/process
- GET /sessions/{id}/status
- GET /sessions/{id}/results

Frontend expects v2 contract, provided:
- POST /v2/sessions
- GET /v2/sessions/{id}
- PUT /v2/sessions/{id}/config
- POST /v2/sessions/{id}/analyze
- GET /v2/sessions/{id}/results
- GET /v2/domains
- GET /v2/domains/{domain}/results?sessionId=...
- GET /v2/domains/{domain}/agents
- WS /v2/sessions/{id}/ws

Agents implemented (deterministic placeholders):
- Smart Document Agent (parses CSV/XLSX)
- Entity Intelligence Agent (rule-based extraction, dedup)
- Carbon Expert Agent (GHG baseline)
- PCF Expert Agent (ISO 14067 readiness)
- Nature Expert Agent (TNFD/BNG baseline)
- Report Generator
