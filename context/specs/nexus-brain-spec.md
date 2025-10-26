# Nexus Brain Configuration & Intelligence Spec

## 1. Problem Statement
Nexus needs a reliable “brain” that bootstraps and maintains the context the orchestrator and every downstream super/utility agent depends on. Today the sustainability domains (carbon, nature, circularity, reporting, social, finance, etc.) assume curated context exists, but we do not yet have a consistent system for:
- Selecting and persisting the current customer/company profile.
- Discovering and harvesting the relevant public artefacts (reports, filings, websites).
- Normalising, vectorising, and enriching those artefacts for retrieval.
- Continuously monitoring for new or changed information.
- Surfacing summary insights that the Nexus orchestration agent can feed into super/utility agents.

Without this capability we risk misaligned recommendations, stale data, and duplicated effort across domain agents.

## 2. Goals & Success Criteria
### Goals
1. **Company Selection & Persistence** – Allow an operator to pick the target company during initial setup, persist that selection at the account level (not per session), and propagate it across the platform.
2. **Document Discovery & Harvesting** – Identify authoritative public sources for the chosen company (sustainability, climate, nature, ESG, TNFD, etc.) and capture them as versioned artefacts.
3. **Content Pipeline** – Parse and vectorise harvested artefacts, annotate metadata, and store them in the shared memory layer (object store + embeddings + structured facts).
4. **External Data Enrichment** – Connect to complementary public datasets (e.g., CDP, SEC, NGO repositories) keyed to the selected company.
5. **Brain Insights** – Generate high-level company profiles, context memos, and feed summaries that Prime Nexus can share with super and utility agents across every domain.
6. **Continuous Scanning** – Re-run targeted discovery on a schedule to detect new or updated artefacts; notify and automatically ingest.
7. **Orchestrator Integration** – Expose APIs so the Nexus orchestration agent (LangChain/LangGraph supervisor) can fetch the latest context snapshots, embeddings, and insight capsules for any domain.

### Success Criteria
- Users can select a company during account setup; the selection persists, is auditable, and can be switched deliberately with rollback.
- For the top ten pilot companies, ≥90% of public sustainability/ESG reports from the past three fiscal years are ingested within 24h.
- Vector store coverage (tokens embedded) moves from baseline 0 to ≥95% of harvested pages within an hour of ingestion.
- Brain summaries (company profile, sustainability posture, key risks, latest filings) are refreshed within 6h of a detected change.
- Brain playback dashboard surfaces contextual alerts (e.g., facility count gaps) and captures operator confirmations/questions within the initial setup session.
- Super agents and key utility agents across all sustainability domains can query the brain context API and retrieve grounding documents with latency <400 ms (P95).
- Continuous scan detects new documents across monitored sources with false positive rate <10%.
- Audit logs exist for every discovered artefact, including source URL, timestamp, checksum, and downstream usage.

### Non-Goals
- Building private connector ingestion (ERP/HR) – future phase.
- Delivering agent-specific prompts (handled downstream).
- Real-time streaming of proprietary market data.

## 3. Users & Stakeholders
- **Sustainability Program Leads** – select and update the current company focus, review harvested artefacts.
- **Nexus Orchestration Agent** – consumes summaries, retrieval API, and memory to drive workflows.
- **Domain Super Agents & Utility Agents (carbon, nature, circularity, reporting, social, finance, boundary, activity data, QA, etc.)** – rely on the curated brain context for grounding and guardrails.
- **Data Scientists / Admins** – monitor pipeline health, tune discovery rules, troubleshoot ingestion.

## 4. Current State
- Frontend “Brain” page shows an onboarding flow but lacks persistence & rehydration of selected company details; selection currently lives in transient UI state.
- Backend `RealCompanyIntelligenceAgent` fetches web pages ad hoc but does not save artefacts into the shared stores or schedule rescans.
- No unified schema for artefact metadata; vector DB integration is partial.
- Nexus orchestrator loads context primarily from workflow inputs, not a shared brain service.

## 5. Proposed Architecture
The design follows the existing Nexus architecture principles: LangChain/LangGraph orchestration with typed agent contracts, shared multi-store memory (Postgres, Qdrant, Neo4j, object storage), and FastAPI services.

### Components
1. **Brain Controller (FastAPI)**
   - Endpoints for company selection, artefact catalog, manual uploads, summaries, and scan triggers.
   - Persists state via SQL (accounts, company_profile, artefacts, scan_jobs) ensuring each account is bound to exactly one active company at a time.
2. **Discovery Service**
   - Runs targeted scrapers + search heuristics (seeded by company name, aliases, stock tickers).
   - Emits `ArtefactDiscovered` events.
3. **Ingestion Pipeline**
   - Orchestrated by a Celery worker (or LangChain flow) to download, store (S3/minio), parse (PDF, HTML), and normalise metadata.
   - Pushes embeddings to Qdrant, structured extracts to Postgres/graph DB.
4. **Insight Generator**
   - LangChain agents generating:
     - Company quick facts.
     - Sustainability posture summary (carbon, nature, social).
     - Observed commitments/goals.
   - Stores summarised capsules accessible via API.
5. **Continuous Scanner**
   - Cron/async scheduler leveraging discovery service with delta detection (checksum & last-modified).
6. **API Contracts**
   - `POST /v2/brain/company` – select/update company.
   - `GET /v2/brain/company` – current profile + metadata.
   - `GET /v2/brain/artefacts` – list with filters (type, framework, updated_after).
   - `POST /v2/brain/rescan` – manual trigger (admin).
   - `GET /v2/brain/insights` – summary packets for orchestrator.
   - `GET /v2/brain/context` – returns retrieval-ready bundle (top-k embeddings, metadata).
7. **Brain Dashboard (Next.js)**
   - Central UI surface for company selection, discovery progress, manual uploads, “brain playback” summaries, integrity alerts, and scan history.

### Data Flow
1. User selects company during onboarding → Brain Controller upserts `company_profile` and `account_company`.
2. Discovery Service seeds queries (official site, report portals, regulatory filings) scoped to the persisted company metadata.
3. For each discovered artefact (including manual uploads):
   - metadata captured; file downloaded to object store.
   - Parser extracts text, tables → embeddings stored.
   - Structured cues (KPIs, targets) saved as JSON in Postgres.
4. Insight Generator runs summarisation prompts referencing the new artefacts and operator feedback.
5. Continuous Scanner (manual/weekly) checks for deltas, feeding back into ingestion.
6. Orchestrator queries context before every workflow start; caches relevant embeddings, insights, and alerts for downstream agents.

### Continuous Learning & Knowledge Consolidation
To satisfy the "always-on" brain vision, the service operates a background loop that:
- Listens to orchestrator run telemetry (`agent_logger`, `learning_engine`) and appends structured learnings (accepted recommendations, rejected outputs, user clarifications) to the Brain knowledge graph.
- Replays session transcripts through lightweight retrievers to detect new entities, targets, or policies that were surfaced during human/agent collaboration and ingests them as derived artefacts.
- Maintains freshness SLAs: high-priority companies rescan every 6 hours, standard accounts every 24 hours, with backpressure controls so scans pause during maintenance windows.
- Updates vector and graph stores incrementally—deltas only—so downstream agents always reference the most recent context without re-embedding entire corpora.
- Emits `BrainHeartbeat` events so supervisors know the context currency before launching workflows; if the heartbeat exceeds the SLA threshold, the orchestrator either queues a rescan or blocks execution pending user approval.
- Aggregates cross-run metrics (facility counts, emission targets, unresolved issues) and shares them via `/v2/brain/insights` so all super/utility agents benefit from historical learning, not just the session that discovered the information.

## 6. Detailed Workflow
1. **Company Selection**
   - UI: drop-down + search (name, ticker, domain) presented during onboarding; subsequent changes require explicit confirmation.
   - Backend verifies uniqueness, stores canonical identifiers (LEI, ISIN if available), and binds the result to the account record.
   - Emits event `CompanyContextChanged`.
2. **Initial Discovery & Manual Uploads**
   - Bootstraps sources:
     - Corporate sustainability page, ESG report repository.
     - Regulatory filings (SEC, ESMA, Companies House).
     - NGO/advisory trackers (CDP, SBTi disclosure, TNFD pilot statements).
   - Uses heuristics and optional LLM-performed SERP parsing.
   - Operators can upload additional artefacts manually (e.g., spreadsheets, internal PDFs) which are tagged with `source=manual` and processed through the same pipeline.
3. **Ingestion & Parsing**
   - File types: PDF, HTML, DOCX, XLSX.
   - Tools: pdfplumber, unstructured, table recognition.
   - Metadata: `source_url`, `published_at`, `language`, `topics` (carbon/nature/social), `checksum`.
   - Embedding: `text-embedding-3-large` (configurable) stored in Qdrant collection `company_brain`.
4. **Enrichment**
   - Cross-reference with open datasets (Sustainability API aggregator, UNESCO, etc.).
   - Attach dataset identifiers to artefacts.
5. **Insight Generation & Playback**
   - Multi-prompt pipeline:
     - Executive summary (3-5 bullets).
     - Carbon & nature positioning (per frameworks).
     - Key commitments + deadlines.
     - Opportunities, risks, and outstanding questions the user should confirm.
   - Save results with lineage (which artefacts used, prompt version).
   - Produces a “brain playback” view summarising objectives, progress, and flagged gaps; UI captures operator responses to refine context (e.g., confirm facility counts, targets).
6. **Continuous Monitoring**
   - Phase 1: manual or scheduled (e.g., weekly) rescans to balance freshness with operational risk; fully continuous scanning is a future enhancement.
   - Only new/changed artefacts go through ingestion.
   - Notifications & audit log entries for new findings.
7. **Orchestrator Consumption**
   - Before each workflow run, Nexus orchestrator (LangGraph supervisor) calls `GET /v2/brain/context?account_id=...` retrieving:
     - Summary capsules (JSON).
     - Top embeddings keyed by the requested domain(s) (carbon, nature, circularity, reporting, social, finance, etc.).
     - Artefact references for citation.
   - Includes contextual integrity checks (e.g., facility counts vs. benchmarks) so downstream agents can react to potential gaps.

## 7. Data Model (Draft)
Tables (Postgres):
- `company_profile (id uuid PK, name, ticker, lei, website, status, created_at, updated_at)`
- `account_company (account_id uuid PK, company_profile_id FK, selected_at, updated_by, notes)`
- `company_alias (profile_id FK, alias)`
- `artefact (id uuid, profile_id FK, url, title, file_key, media_type, published_at, checksum, topics[], frameworks[], ingestion_status, created_at)`
- `artefact_text (artefact_id FK, chunk_id, content, embedding_vector ref)`
- `insight (id uuid, profile_id FK, type enum {summary, carbon_posture, nature_posture, risk_radar}, content jsonb, source_artefact_ids[], generated_at, prompt_version)`
- `scan_job (id uuid, profile_id FK, status, started_at, completed_at, source_type, delta_count)`

Object Storage:
- `brain/<company_id>/<artefact_id>/<filename>`

Vector Store (Qdrant):
- Collection `brain_<company_id>` or shared collection with `company_id` tag, payload storing `artefact_id`, `chunk_id`, `topics`.

Event Bus (optional initial implementation via Postgres LISTEN/NOTIFY or Redis Streams):
- `CompanyContextChanged`
- `ArtefactDiscovered`
- `ArtefactIngested`
- `InsightGenerated`

## 8. Interfaces & Contracts
### REST
```http
POST /v2/brain/company
{
  "name": "Example Corp",
  "ticker": "EXAMP",
  "lei": "549300...",
  "website": "https://example.com"
}
→ 201 { "company_id": "...", "account_company_id": "...", "selected_at": "..." }
```

```http
GET /v2/brain/artefacts?topics=carbon&updated_after=2025-09-01
→ 200 {
  "artefacts": [
    {
      "id": "...",
      "title": "...",
      "source_url": "...",
      "published_at": "...",
      "frameworks": ["ESRS", "TNFD"],
      "latest_ingestion": {
        "status": "complete",
        "vector_chunks": 42
      }
    }
  ]
}
```

```http
GET /v2/brain/context?account_id=...&domain=carbon&k=12
→ 200 {
  "summary": {...},
  "insights": [...],
  "alerts": [
    {
      "type": "data_gap",
      "message": "Only 10 facilities detected; peers average 120+. Confirm whether additional boundary data is forthcoming.",
      "severity": "warning",
      "recommendation": "Upload latest global facility register."
    }
  ],
  "embeddings": [{
    "vector": [...],
    "artefact_id": "...",
    "excerpt": "...",
    "metadata": {...}
  }]
}
```
*Domain parameter accepts values for every designated super/utility domain (carbon, nature, circularity, social, reporting, finance, supply_chain, etc.) consistent with the architecture catalog.*

### CLI / Admin
- `specify` integration for spec management (already in place).
- Future: `python -m brain.scanner --company <id> --rescan`.

## 9. Security, Compliance, & Observability
- All harvested documents stored with checksum + version history, S3 bucket with encryption at rest.
- Respect robots.txt and usage terms for public content; maintain source attribution.
- Observability:
  - OpenTelemetry traces for discovery and ingestion pipelines.
  - Metrics (Prometheus): documents_found, ingestion_latency, embeddings_generated, scan_failures.
  - Alerting on scan job failure or embedding backlog.
- Privacy: only public information; ensure we do not store PII inadvertently (flag detection using regex/LLM classifier).

## 10. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scraper blocks or CAPTCHAs | Missed artefacts | Use provider APIs where possible (SEC EDGAR API, company RSS), backoff & proxy pool. |
| Hallucinated insights | Misleading brain context | Store source artefacts IDs with every summary, implement retrieval-augmented prompting plus verification. |
| Vector store cost growth | Infra cost | Chunk dedupe, size limits, TTL for stale artefacts, compression. |
| Continuous scans overload source sites | Rate-limit | Adaptive scheduling, respect robots.txt, caching of HEAD requests. |
| Orchestrator uses stale context | Incorrect workflows | Add version headers in API responses; orchestrator validates `context_version` per run. |
| Account/company mismatch | Wrong company context driving agents | Restrict endpoints to resolve `account_company` mapping; change flow requires confirmation, audit entry, and downstream cache invalidation. |
| Context versus workflow data mismatch goes unnoticed | Bad recommendations (e.g., missing facilities) | Implement comparison rules (facility counts, geographic coverage) and surface Brain alerts + orchestrator warnings. |

## 11. Milestones (Priority Order)
1. **P0 – Company anchoring & manual discovery**: Implement account-level company persistence (`account_company`), onboarding UI, initial discovery service, and manual document upload flow.
2. **P0 – Content pipeline & memory sync**: Deliver ingestion/parsing, storage in object store + Postgres, embedding into Qdrant, and linkage to LangChain/LangGraph memory interfaces.
3. **P0 – Brain playback & context APIs**: Generate insight capsules, build the brain dashboard playback experience, and expose `GET /v2/brain/context` + `GET /v2/brain/insights` for orchestrator consumption.
4. **P1 – Integrity alerts & enrichment connectors**: Ship comparison rules (e.g., facility counts vs. benchmarks), alert surfacing, and integrate priority external datasets (CDP/SBTi/etc.).
5. **P1 – Scheduled rescans & observability**: Add weekly (configurable) rescan scheduler, monitoring/metrics, and admin diagnostics for discovery/ingestion jobs.
6. **P2 – Pilot hardening & QA**: Run pilot with target companies, expand regression/performance tests, capture feedback, and prepare GA documentation/playbooks.

## 12. Testing Strategy
- **Unit Tests**: parsing utilities, discovery heuristics, API validation.
- **Integration Tests**:
  - End-to-end ingestion using recorded fixtures for sample companies.
  - Vector store retrieval verifying top-k accuracy vs. baseline.
- **Regression Suite**: run nightly `brain` pipeline on sandbox company.
- **Smoke Tests**: CLI/REST check verifying company selection works and a sample document is discoverable.
- **Performance Tests**: ingestion latency and context API response times with synthetic load.

## 13. Open Questions
1. Do we need immediate multi-company support (workspace switching) or per deployment single company?
2. Which external public datasets are must-have for v1 (CDP, SBTi commitments, UNGC, etc.)?
3. Should continuous scanning run per company cron or event-driven (webhooks/SaaS feeds)?
4. How do we surface scan alerts to users (email, in-app notifications, Slack)?
5. Do downstream agents require raw text chunks or curated knowledge cards?
6. What lightweight account concept do we standardise on now to persist the company selection without introducing a full sign-up flow?

## 14. Dependencies
- Existing `RealCompanyIntelligenceAgent` (for discovery heuristics) – will refactor into Discovery Service.
- Object storage (MinIO/S3) and Qdrant already configured in architecture.
- Scheduler (APScheduler or Temporal) – choose one consistent with broader platform roadmap.
- Access to open web for harvesting (network egress policies).

## 15. Rollout & Change Management
- Feature flag: `brain.v1_enabled`.
- Gradual rollout: start with internal accounts, then limited external pilot.
- Document operational runbooks (diagnostics, reprocessing).
- Update training materials for sustainability leads and support staff.

---

Prepared by: *Codex Agent*  
Date: 2025-10-25  
Related documents: `context/ARCHITECTURE.md`, `context/REQUIREMENTS.md`, existing company intelligence tests. 
