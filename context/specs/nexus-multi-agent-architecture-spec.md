# Nexus Multi-Agent Architecture Specification

## 1. Problem Statement
Nexus needs a durable, multi-agent architecture that orchestrates expert agents across sustainability domains (carbon, nature, PCF, reporting, circularity, social/ESG, etc.). Today the FastAPI orchestrator wires together several agents, but the platform lacks a documented, end-to-end specification for:
- How LangChain/LangGraph supervisors coordinate domain-specific super agents and their utility agents.
- How shared memory (SQL, vector, graph, object storage) is presented as a first-class substrate for every agent.
- How governance, observability, and human-in-the-loop controls are enforced consistently across domains.
- How the system extends beyond the initial carbon/org-boundary workflow into the broader sustainability roadmap.

Without an explicit architecture spec, teams risk fragmenting orchestration logic, duplicating data pipelines, and diverging from the guardrails defined in `context/ARCHITECTURE.md`.

## 2. Goals & Success Criteria
### Goals
1. Describe the canonical multi-agent topology (Prime Nexus supervisor → domain super agents → utility agents) and how it maps to LangChain/LangGraph constructs.
2. Define shared infrastructure services (memory, telemetry, governance, tooling) that every agent must use.
3. Capture the cross-domain workflow expectations (carbon, nature, PCF, reporting) so new agents plug into the same orchestrator contracts.
4. Provide implementation guidance for extending the current FastAPI orchestrator into a LangGraph-based execution graph with resumability and policy routing.

### Success Criteria
- LangGraph graph definition exists for each orchestrated workflow with typed inputs/outputs and supervisor policies.
- All domain super agents publish metadata via `/v2/domains` and share a consistent lifecycle (ready → running → human-review → complete).
- Agent runs persist memory artefacts to SQL + vector + graph stores with <500 ms round-trip overhead for retrieval.
- Observability (OpenTelemetry traces, structured events, metrics) covers ≥95% of agent/tool invocations.
- Adding a new sustainability agent requires <1 day of scaffolding because contracts, governance, and memory interfaces are pre-defined.

## 3. Scope & Alignment
- **In scope:** backend orchestrator, agent contracts, shared services, frontend surfacing of agent runs, multi-domain sustainability workflows.
- **Out of scope:** vendor-specific connectors, UI design system changes, or non-agent services (e.g., billing).
- **Alignment:** adheres to `context/ARCHITECTURE.md` (LangChain/LangGraph, multi-store memory, auditability) and strategy buckets (utility agent → super agent → self-improving system).

## 4. Users & Stakeholders
- **Prime Nexus supervisor (system actor):** coordinates domains, enforces policies.
- **Domain owners (product + engineering):** carbon, nature, circularity, reporting teams.
- **Sustainability practitioners:** interact via UI, approve checkpoints, review outputs.
- **Telemetry/governance teams:** need consistent signals for audits, evals, and rollback decisions.

## 5. System Overview & Current State
The FastAPI service (`backend/app`) already instantiates several agents (document parsing, org boundary, carbon/nature experts, report generator) in `AgentOrchestrator`. Flows are mostly sequential and hard-coded, limiting:
- Dynamic branching (e.g., retrying utility agents, looping until quality gates pass).
- Cross-domain knowledge sharing beyond ad-hoc dictionaries.
- Structured policy enforcement (human approvals, escalation, stoppage).
- Clear interface definitions for future agents.

This spec formalises how to evolve the orchestrator into a LangChain/LangGraph graph that emits determined state machines, uses shared memory adapters, and exposes standardized APIs/UIs.

## 6. Proposed Architecture
### 6.1 Prime Nexus Orchestrator
- Implemented with LangGraph’s SupervisorNode, backed by FastAPI endpoints for kicks, resume, cancel, and status.
- Responsible for session lifecycle, routing to domain super agents, aggregating results, and writing telemetry.
- Maintains policy registry (guardrails, SLAs, escalation rules) persisted in Postgres.

### 6.2 Domain Super Agents
- Carbon Accounting Super Agent (detailed separately) coordinating Org Boundary, Activity Data, Emissions Calc, QA, Reporting.
- Nature Intelligence Super Agent orchestrating site-level risk scans, dependency analysis, mitigation planning.
- Future domains: Circularity/Waste, Social/ESG, Supply Chain, Reporting/Disclosure.
- Each super agent is a LangGraph subgraph with a domain-specific supervisor and typed edges to its utility agents.

### 6.3 Utility Agents & Tool Layer
- Utility agents encapsulate discrete capabilities (document parsing, entity extraction, factor lookup, QA, report synthesis).
- Tools include connectors (ERP/energy APIs), data processing libraries, prompt stores, and evaluation hooks.
- Each utility agent exposes `input_schema`, `output_schema`, `tooling_requirements`, and `quality_gates` metadata for runtime validation.

### 6.4 Shared Memory Plane
- **SQLMemory:** Postgres tables for runs, checkpoints, approvals, artefact metadata.
- **VectorMemory:** Qdrant/Pinecone indexes storing embeddings for artefacts, chat transcripts, decisions, and Brain insights.
- **GraphMemory:** Neo4j storing entities, relationships, provenance, and cross-domain ontologies.
- **Object Storage:** S3/MinIO for raw uploads, exports, and large artefacts.
- Memory adapters follow LangChain’s retriever interface so any agent can request contextual grounding by tag (e.g., `company_id`, `domain`, `signal_type`).

### 6.5 Frontend & API Surfaces
- `/v2/sessions` for workflow lifecycle (kickoff, status, stop, resume).
- `/v2/domains` metadata for UI explorer (agent lineup, prompts, tool contracts).
- WebSocket streaming for live step telemetry (already partially implemented for org boundary) extended to every agent.
- Next.js dashboards show multi-domain progress, quality gates, and Brain-derived alerts.

### 6.6 Governance & Observability
- OpenTelemetry tracing across orchestrator, agents, and tool invocations; traces correlate with session IDs.
- Failure logger + learning engine capture structured learning signals for post-run improvements.
- ADRs track architectural changes; prompts, tools, version info stored with each run for audit.
- Human-in-the-loop checkpoints enforced as graph nodes that pause until approval/resolution.

## 7. Agent Topology & Workflow Example
1. **Kickoff:** User uploads docs → FastAPI `POST /v2/sessions/{id}/process` registers session with context (company, domain, workflow target).
2. **Brain hydration:** Prime Nexus pulls latest Brain insight bundle (company profile, artefacts, embeddings) and seeds shared memory references for the run.
3. **Document intelligence:** SmartDocument + EntityIntelligence agents normalize inputs, emit structured artefacts, and write to memory.
4. **Domain routing:** Supervisor selects Carbon Super Agent for carbon-accounting workflow; Carbon agent orchestrates Org Boundary utility agents (parsing, column mapping, hierarchy building, QA, export) using LangGraph edges and guardrails.
5. **Cross-domain fan-out:** Once canonical entities exist, Nature/PCF/Reporting agents can run in parallel branches, consuming the same memory handles.
6. **Quality gates:** Each agent outputs metrics; supervisor enforces thresholds (e.g., data quality score ≥ 0.85) or routes to remediation path.
7. **Results aggregation:** Prime Nexus consolidates outputs, stores them in Postgres/object storage, and emits websocket + REST updates to UI.
8. **Learning loop:** Run telemetry + user feedback feed the learning engine and Brain for continuous improvement.

## 8. Interfaces & Data Contracts
- All agent inputs/outputs defined as Pydantic models with JSON Schema exports for frontend/partner validation.
- Memory references (vector IDs, graph node IDs, artefact URIs) passed via structured `MemoryHandle` objects, not raw strings.
- Domain metadata endpoint returns: `agent_id`, `version`, `description`, `inputs`, `outputs`, `tools`, `quality_gates`, `dependencies`.
- Session events follow CloudEvents-compatible envelope for reuse in telemetry pipelines.

## 9. Implementation Plan (Milestones)
1. **P0 – Graphified Orchestrator:** Convert current sequential workflow into LangGraph definition with Prime supervisor + Carbon Super Agent nodes. Preserve existing functionality while emitting typed events.
2. **P0 – Memory Adapters:** Implement SQL/vector/graph/object adapters with caching and tagging so current Org Boundary + Carbon/Nature agents read/write consistently.
3. **P1 – Domain Expansion:** Add Nature Super Agent graph, wire `/v2/domains` metadata, expose domain selection in frontend.
4. **P1 – Governance Hooks:** Add approval nodes, escalation policies, and runbook integrations (Slack/email) for checkpoints.
5. **P2 – Self-Improving Loop:** Integrate learning engine + Brain to auto-tune prompts/policies based on run telemetry and user feedback.

## 10. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| LangGraph complexity slows delivery | Delayed releases | Start with Carbon workflow, reuse adapters across domains, add extensive unit tests for graph transitions. |
| Memory stores fall out of sync | Agents make decisions on stale data | Use transactional writes + version headers; Brain provides `context_version` and supervisor validates before execution. |
| Governance bypass | Non-compliant outputs | Encode approvals as nodes that cannot be skipped; log every override with audit payload. |
| Observability gaps | Hard to debug multi-agent runs | Instrument graph edges with OpenTelemetry spans + structured events; enforce tracing in CI. |
| Scaling concurrency | High load overwhelms services | Use async execution + work queues per domain; throttle via scheduler + resource tags. |

## 11. Testing & Validation
- **Unit tests:** Graph transition logic, policy guards, memory adapter CRUD.
- **Integration tests:** Simulated runs per domain verifying LangGraph execution, memory writes, and telemetry events.
- **Smoke tests:** `scripts/smoke.sh` extended to kick off orchestrated workflows and validate key outputs (org boundary exports, summary JSON).
- **Load tests:** Replay representative workloads to validate queueing, memory latency, and websocket streaming under stress.

## 12. Open Questions
1. What SLA do we need for cross-domain parallelization (e.g., run carbon + nature simultaneously vs sequential)?
2. Do we require Temporal or another workflow engine for reliability, or can LangGraph + Postgres checkpoints suffice for v1?
3. How should user personas influence routing (e.g., sustainability lead vs auditor) – separate policy sets or context flags?
4. When do we expose plugin slots for customer-specific utility agents, and how do we vet them for security/compliance?

---
Prepared by: *Codex Agent*
Date: 2025-10-25
References: `context/ARCHITECTURE.md`, `context/REQUIREMENTS.md`, `backend/app/orchestrator.py`
