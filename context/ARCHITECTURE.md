# Architecture

This document defines the target architecture for Nexus. It establishes gold-standard defaults. Any deviation requires explicit approval from the application owner.

## Principles
- LangChain-based orchestration with explicit agent contracts and tools
- Polyglot runtime: Node.js (frontend, orchestration UI, lightweight services) and Python (LLM tools, data/ML, heavy agents)
- Multi-store memory: SQL (ops + metadata), Vector DB (semantic memory), Graph DB (entity/relationship knowledge), Object storage (artifacts)
- Security, privacy, and auditability by design

## High-level components
- Frontend (Next.js/React)
  - Agent workspace UI, chat, task boards, approvals, run timelines
  - Uploads and artifact previews
- Backend Services
  - Orchestrator Service (Python, LangChain):
    - Supervisor (Nexus) → Domain Supervisors (e.g., Carbon Super Agent) → Utility Agents
    - Routing, retries, timeouts, escalation, human-in-the-loop checkpoints
    - RAG layer (retrievers over vector + graph + SQL)
  - Tooling Service (Python): file parsing, OCR, table extraction, Excel I/O, connectors
  - Telemetry & Governance Service: traces, metrics, evaluations, policy versions, ADR registry
- Data Layer
  - SQL DB: Postgres for run metadata, users, tasks, approvals, artifacts index
  - Vector DB: e.g., Pinecone/Weaviate/Qdrant for embeddings of docs, tables, and chats
  - Graph DB: Neo4j for entities, relationships, provenance, and domain schemas
  - Object Storage: S3-compatible bucket for raw files and generated outputs

## Agent orchestration (LangChain suite)
- Use LangGraph (LangChain) for multi-agent workflows with graphs and supervisors
- Define each agent as a node with typed inputs/outputs (pydantic/dataclasses)
- Shared memory interfaces:
  - VectorMemory: embeds artifacts and chat transcripts
  - GraphMemory: persists entities/relations (e.g., LegalEntity → Location → ReportingUnit)
  - SQLMemory: structured facts, run states, approvals
- Retrieval stack combines vector similarity, graph traversal, and SQL lookups

## Example: Carbon Accounting flow
1. Org Boundary & Structure Agent
   - Tools: document loaders, table extraction, graph write/read, schema validators
   - Outputs: canonical entity table, narrative, recommendations
2. Activity Data Acquisition & Cleansing Agent
   - Tools: connectors (ERP/energy), schema matching, anomaly detection
   - Outputs: validated activity tables, issue log, next-step tasks
3. Emissions Calculation Agent
   - Tools: emissions factor lookup, allocation methods, uncertainty flags
   - Outputs: emissions by scope/category, calc lineage
4. QA/Controls Agent → Reporting Agent

Supervisor coordinates handoffs and checkpoints.

## Data contracts and schemas
- Define pydantic models for inputs/outputs of each agent
- Use JSON Schema for cross-language validation (Node ↔ Python)
- Version schemas; enforce backward compatibility or provide migration utilities

## Observability & governance
- OpenTelemetry traces per run; structured logs and events
- Metrics: task success rate, latency, tool accuracy, RAG hit@k
- Versioned prompts, tools, and policies; store diffs and changelogs
- ADRs for deviations; require owner approval before merge

## Security & compliance
- Secrets via vault (e.g., AWS Secrets Manager); no secrets in code
- RBAC and tenant isolation in all stores and services
- Encryption in transit and at rest; PII minimization and masking
- Audit logs for access, decisions, and data movement

## Tech choices (initial, can be revisited with approval)
- Frontend: Next.js, TypeScript, Tailwind/Shadcn UI (already present)
- Backend: Python 3.11+, FastAPI for service endpoints
- Orchestration: LangChain + LangGraph
- Vector DB: Qdrant (local/dev) or Pinecone (managed)
- Graph DB: Neo4j Aura or self-managed Neo4j
- SQL: Postgres
- Object Storage: AWS S3 (or MinIO locally)
- Telemetry: OpenTelemetry + Grafana/Tempo/Loki, or LangSmith for evals/traces

## Change control
- Any architectural deviation requires explicit written approval from the application owner
- Record decisions as ADRs in `context/adr/` with rationale and impact
- Enforce via CI checks: schema validation, security scans, and ADR presence for changes
