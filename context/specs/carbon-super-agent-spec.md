# Carbon Accounting Super Agent Specification

## 1. Problem Statement
Carbon accounting is the flagship Nexus workflow and already includes sophisticated utilities (document parsing, Org Boundary Agent, carbon/nature experts). However, we lack a formal specification describing how the Carbon Super Agent should orchestrate its subordinate utility agents, integrate with the Nexus Brain, and deliver auditable outputs spanning boundary definition, activity data readiness, emissions calculation, QA, and reporting. Without this spec, capabilities risk remaining siloed (e.g., org-boundary-only runs) and cannot scale to the multi-agent, LangGraph-based execution model defined in the architecture vision.

## 2. Goals & Success Criteria
### Goals
1. Define the Carbon Super Agent topology (phases, utility agents, decision points) aligned to GHG Protocol scopes 1–3 and PCF extensions.
2. Capture how the super agent consumes Brain context, shared memory, and human feedback loops to continuously improve recommendations.
3. Specify inputs/outputs, quality gates, and audit artefacts for each phase so other domains (nature, reporting) can reuse canonical data structures.
4. Provide an implementation roadmap for elevating the current FastAPI workflow into a LangGraph graph with resumability, retries, and checkpoints.

### Success Criteria
- For pilot companies the Carbon Super Agent generates a consolidated boundary, validated activity data backlog, emissions estimates, QA findings, and reporting-ready exports in a single orchestrated run.
- Utility agents expose typed schemas; ≥90% of runs meet quality gates without manual intervention, and all exceptions are surfaced with remediation guidance.
- Shared memory artefacts (entities, hierarchy, activity data, emissions results) are written to SQL/vector/graph stores with provenance metadata for downstream agents.
- UI dashboards show live progress per phase, metrics (data quality, coverage), and approvals passed/blocked.

## 3. Scope & Alignment
- **In scope:** carbon-oriented orchestration across boundary consolidation, activity data readiness, emissions computation, QA/controls, and reporting packaging. Includes subordinated utility agents and their tool stacks.
- **Out of scope:** non-carbon sustainability workflows (handled by other super agents), ERP connector implementations beyond the defined interfaces, or customer-specific bespoke methodologies without approval.
- **Alignment:** builds on strategy bucket #1 (utility agent) and #2 (super agent orchestration) while complying with `context/ARCHITECTURE.md` guardrails.

## 4. Users & Stakeholders
- Sustainability leads and carbon accountants who rely on Nexus to accelerate boundary, data, and emissions tasks.
- Prime Nexus orchestrator and Brain services that supply input context and consume outputs for other domains.
- Data governance/audit teams needing traceability of boundary decisions, calculation methods, and approvals.

## 5. Current State Snapshot
- Backend `AgentOrchestrator` chains SmartDocument → OrgBoundary → EntityIntelligence → Carbon/PCF/Nature experts → report generation.
- Org Boundary Agent already performs multi-stage parsing, schema mapping, hierarchy building, QA, and export generation but runs as a monolith node.
- Activity data, emissions, QA, and reporting logic are placeholders; there is no unified super-agent concept or quality gate enforcement.
- UI exposes primarily the org-boundary run with limited cross-phase telemetry.

## 6. Proposed Carbon Super Agent Architecture
### 6.1 LangGraph Structure
- **Supervisor node (`CarbonSuperAgentSupervisor`)** orchestrates phases, enforces guardrails, and records metrics.
- **Phases (graph nodes):**
  1. *Context Hydration* – pulls Brain bundle + prior runs, validates prerequisites (company selection, artefact freshness).
  2. *Document Intake & Normalisation* – SmartDocument + EntityIntelligence pipeline.
  3. *Org Boundary Utility Suite* (see Section 7) – multi-step subgraph producing canonical entities, hierarchy, data quality ledger, exports.
  4. *Activity Data Agent* – ingests ERP/energy spreadsheets, runs schema alignment, flags gaps, drafts remediation backlog.
  5. *Emissions Calculation Agent* – computes scope/category emissions using validated factors, method selection, and lineage capture.
  6. *QA & Controls Agent* – variance checks, threshold comparisons, governance validations, audit trails.
  7. *Reporting Agent* – packages outputs (CSRD/ESRS-ready narrative, tables, charts) and pushes to object storage/UI.
  8. *Review & Decision Nodes* – pauses for human approval when material boundary shifts or emissions deviations exceed tolerance.
- Each node writes to shared memory and emits telemetry to `agent_logger`.

### 6.2 Data & Memory Contracts
- Common `CarbonRunContext` object: `{company_id, session_id, workflow_version, artefact_refs, prior_run_ids, regulatory_scope}`.
- Canonical tables persisted via SQL + exported as structured artefacts:
  - `entities`, `hierarchy`, `boundary_decisions`, `activity_data`, `emissions_results`, `qa_findings`, `report_packages`.
- Vector payloads tagged with `company_id`, `domain=carbon`, `phase`, and `quality_score` for retrieval.
- Graph DB nodes: `LegalEntity`, `Facility`, `BoundaryDecision`, `EmissionResult`, relationships capturing ownership/control, lineage, and methodology.

### 6.3 Quality Gates & Metrics
- Boundary quality score (completeness, consistency, lineage) must be ≥0.85 before downstream phases run.
- Activity data coverage target ≥80% of scoped emissions categories; otherwise branch to remediation backlog before calculations.
- Emissions calculation requires factor provenance and uncertainty scoring; QA ensures variance vs prior period < configurable threshold.
- Each gate surfaces recommended actions, enabling manual overrides logged with justification.

## 7. Org Boundary Utility Suite (Sub-Utility Agents)
To satisfy the requirement for an agent with subordinate utilities that ingest documents and deliver a consolidated organisational boundary, we define the following nodes:
1. **Document Intake Agent** – wraps SmartDocument, enforces file validation, metadata capture, and provenance logging.
2. **Schema & Column Intelligence Agent** – performs header analysis, canonical field mapping, confidence scoring, and emits unmapped column remediation tasks.
3. **Entity Normaliser Agent** – deduplicates, IDs, normalises geography/ownership, and writes canonical entity rows with audit payloads.
4. **Hierarchy Builder Agent** – constructs parent-child graph, detects cycles/orphans, enforces governance rules (ownership %, control cues).
5. **Boundary Reasoner Agent** – classifies include/review/exclude decisions, drafts rationales referencing data + frameworks, and proposes actions for ambiguous cases.
6. **Data Quality & Controls Agent** – aggregates completeness/accuracy/consistency/validity/uniqueness metrics, generates issue ledger with severity/owner/hint fields.
7. **Export & Narrative Agent** – packages Excel/CSV deliverables, textual summary, recommendations, and pushes them to object storage + UI download queue.

Each sub-agent consumes/produces typed payloads so they can be run independently (for retries) or as part of the larger carbon workflow. They inherit prompts + overrides from `backend/app/agents/org_boundary.py` and expose telemetry over WebSocket.

## 8. Activity Data & Emissions Modules
- **Activity Data Agent**
  - Inputs: canonical entities, Brain artefact references, uploaded ERP/energy data, target scopes.
  - Responsibilities: schema detection, unit normalization, control total reconciliation, gap detection, imputation recommendations, task backlog generation.
  - Outputs: structured tables ready for emissions calculations + issue backlog.
- **Emissions Calculation Agent**
  - Inputs: activity data tables, emission factor catalog (internal/external), methodology policies (location vs market-based, equity share vs control).
  - Responsibilities: compute emissions per scope/category, track calculation lineage, quantify uncertainty, detect anomalies vs prior periods.
  - Outputs: `emissions_results` table, narrative, audit log references, data for reporting agent.

## 9. QA/Controls & Reporting
- QA agent cross-checks boundary vs activity data coverage, ensures no orphan facilities, validates factor versions, and logs control evidence.
- Reporting agent composes CSRD/ESRS-ready narratives, KPI tables, variance charts, and attaches zipped workpapers for assurance teams.
- Both nodes reference the Brain for benchmarks (peer facility counts, disclosed targets) to contextualise findings.

## 10. Interfaces & API Contracts
- `/v2/sessions/{id}/domains/carbon` – kickoff w/ payload `{workflow_variant, documents[], scope, regulatory_profile}`.
- `/v2/domains/carbon` – metadata describing phases, inputs, outputs, prompts, version.
- `/v2/carbon/runs/{id}` – status, metrics, quality gates, downloadable artefacts (entities, activity data, emissions, QA reports).
- Telemetry streamed via `/ws/sessions/{id}` with events per sub-agent (`phase`, `status`, `metrics`, `issues`).

## 11. Implementation Plan
1. **P0 – Org Boundary Subgraph Extraction:** break existing OrgBoundary agent into LangGraph sub-nodes, expose schemas, ensure retries + telemetry per node.
2. **P0 – Supervisor & Context Hydration:** introduce CarbonSuperAgentSupervisor with Brain integration and prerequisite checks.
3. **P1 – Activity Data Agent MVP:** implement parsing + gap detection with fixtures in `backend/tests/carbon-accounting/activity-data`.
4. **P1 – Emissions Calculator MVP:** integrate factor catalog, method selection, lineage logging.
5. **P1 – QA/Controls + Reporting Agents:** enforce gates, generate narratives/exports, update frontend dashboards.
6. **P2 – Hardening:** pilot with real data, extend connectors, add eval harnesses, hook into learning engine for auto-tuning.

## 12. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Sub-agent explosion complicates orchestration | Longer delivery, harder debugging | Start with Org Boundary subgraph (already well-defined), reuse infra (prompts, telemetry) for new nodes, add visualization in UI. |
| Activity data variability | Schema mismatches, poor automation | Invest in schema registry + column intelligence reuse, allow human-confirmed mappings stored in Brain for reuse. |
| Emissions methodology disagreements | Blocked approvals | Encode methodology policies as config profiles; require approvals when deviating; surface citations. |
| Performance regressions | Slow workflows | Stream intermediate outputs, parallelise branches (e.g., QA vs Reporting) once dependencies satisfied. |
| Audit/compliance gaps | Outputs rejected by auditors | Persist lineage, prompts, tool versions; include QA findings + sign-offs in exports. |

## 13. Testing & Validation
- **Unit tests:** sub-agent transformations (column mapping, hierarchy builder, activity data parsers, factor calculators).
- **Integration tests:** recorded fixtures for end-to-end carbon runs (documents → emissions) stored under `backend/tests/carbon-accounting/...`.
- **Regression tests:** nightly run using golden datasets validating boundary metrics, coverage, emissions totals.
- **Smoke tests:** `npm run smoke` triggers carbon workflow and validates presence of exports + metrics in API response.
- **User acceptance:** instrument UI to capture feedback per phase; integrate with learning engine for continuous improvement.

## 14. Open Questions
1. Which emission factor providers (e.g., Climate TRACE, EPA, DEFRA) must be supported in v1, and how will licensing be handled?
2. Do we need real-time connector ingestion (APIs) before GA, or are file-based uploads sufficient for pilots?
3. How will customers configure boundary rules (equity share vs operational control) within the UI? Template selection or rule engine?
4. What approval hierarchy is required for boundary/QA decisions (single reviewer vs multi-level sign-off)?
5. When should we trigger downstream PCF or reporting workflows automatically vs requiring explicit user opt-in?

---
Prepared by: *Codex Agent*  
Date: 2025-10-25  
References: `context/ARCHITECTURE.md`, `context/REQUIREMENTS.md`, `backend/app/agents/org_boundary.py`, `backend/app/orchestrator.py`
