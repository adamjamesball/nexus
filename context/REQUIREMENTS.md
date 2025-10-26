# Requirements

This document captures the key requirements to realize the vision and strategy. It is written for implementers and AI coding agents.

## Functional requirements
- Utility Agents (Carbon Accounting initial)
  - Org Boundary & Structure Agent: ingest multi-format docs; consolidate entities; output canonical table + narrative + recommendations
    - ✅ Run-level success metrics, detailed observability, and admin feedback ingestion wired into workflow
    - ✅ Live agent telemetry streamed via WebSocket with results dashboard limited to the active consolidation lineup
  - Nature Intelligence Agent: assess biodiversity/water risk, produce TNFD-ready outputs, and expose the same metrics/feedback instrumentation as other workflows
  - ✅ Multi-step workflow UI with preview/kickoff, curated agent lineup, and live diagnostics for in-flight runs
  - Activity Data Agent: acquire, validate, and cleanse activity data; flag gaps; propose imputation strategies
  - Emissions Calculation Agent: calculate emissions per scope/category with methodology transparency
  - QA/Controls Agent: run validations, variance checks, and audit trails
  - Reporting Agent: assemble reporting package (Excel/CSV, narrative, visuals) aligned to standards (e.g., CSRD/ESRS)
- Company Intelligence Agent: ✅ onboarding endpoints expose profile discovery, document scouting, and magic-moment insights
  - ✅ Document auto-discovery surfaces live sustainability reports, synthesizes current vs. target positioning, and captures user confirmation/corrections
  - ✅ Company identity resolution uses Google Programmable Search to surface live candidates (name, industry, size, website) for confirmation
- Nexus Brain
  - ✅ `/v2/brain/company` persistently binds accounts to selected company profiles with audit metadata and llama4-backed enrichment
  - ✅ `/v2/brain/context` supplies llama4 summaries, alerts, and retrieval embeddings for super/utility agents
  - ✅ `/v2/brain/artefacts` and `/v2/brain/insights` expose the harvested catalogue and insight capsules for downstream orchestration
- Agent configuration explorer: ✅ dashboard surfaces utility agents, orchestration flows, prompts, and tool contracts
  - ✅ Org Boundary prompts editable in UI with workflow-aligned sequencing and audit metadata
- Super Agents
  - Carbon Accounting Super Agent orchestrates utility agents using defined schemas and checkpoints
  - Nexus Orchestrator coordinates across sustainability domains and manages cross-agent memory/policies
- Collaboration
  - Human-in-the-loop approvals on material decisions; inline comments and tasks
  - Agent recommendations with rationale and suggested next steps
- Memory and Retrieval
  - Persist artifacts, decisions, and facts into vector DB and graph DB; index all user-agent conversations
  - Retrieval augmented generation (RAG) grounded on customer data and policies

## Non-functional requirements
- Reliability: deterministic retries, circuit breakers, graceful degradation
- Observability: tracing per agent run, structured logs, metrics, event timelines
- Auditability: lineage of inputs → decisions → outputs; versioned prompts/policies/tools
- Security & privacy: least-privilege access; encryption at rest/transit; PII handling; tenant isolation
- Performance: interactive responses < 3s for most steps; background jobs scalable
- Extensibility: plug-in architecture for new agents, tools, and data sources
- Governance: changes to architecture, data contracts, and security posture require owner approval

## Data requirements
- SQL database for structured operational data and run metadata
- Vector database for embeddings of documents, tables, and conversations
- Graph database (Neo4j) for entities, relationships, provenance, and domain knowledge
- Data catalog of schemas, embeddings, and lineage references
- S3-compatible object storage for raw artifacts (uploads, generated files, reports)

## Integration requirements
- Connectors for common enterprise sources (ERP, HR, procurement, energy, spreadsheets)
- Standardized file ingestion (CSV, XLSX, PDF, JSON) with parsing and OCR where needed
- Webhooks and event bus for agent progress and external triggers

## Compliance & standards
- Align to GHG Protocol, TNFD, CSRD/ESRS, ISSB/IFRS S2, PCAF, SBTi where applicable
- Maintain explainability and reproducibility to support assurance

## Testing & evaluation
- Golden datasets with expected outputs for org boundary and activity data flows
- Offline evals for RAG quality, tool selection accuracy, and error handling
- Shadow runs in pilots to compare human vs. agent performance before full automation

## Documentation
- Agent contracts (input/output schemas), prompts/policies, and data contracts versioned in repo
- Architecture decision records (ADRs) for significant choices and deviations
- Specifications in `context/specs` (✅ multi-agent architecture, ✅ Nexus Brain, ✅ carbon super agent, ✅ nature super agent) kept current with workflow changes
