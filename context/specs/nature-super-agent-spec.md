# Nature Intelligence Super Agent Specification

## 1. Problem Statement
Nexus needs a dedicated Nature Intelligence Super Agent that operationalises TNFD, BNG, and water/biodiversity risk workflows once the carbon/org-boundary foundation is in place. The current `NatureExpertAgent` provides only a placeholder summary and does not:
- Leverage the Nexus Brain artefacts to build location-aware site inventories.
- Coordinate supporting utility agents (site geocoding, dependency analysis, impact screening, mitigation planning).
- Provide audit-ready outputs, structured risk registers, or remediation roadmaps for sustainability teams.

Without a full specification, the nature domain cannot evolve alongside carbon, leaving a gap in the multi-agent sustainability coverage promised in the vision/strategy documents.

## 2. Goals & Success Criteria
### Goals
1. Define the Nature Super Agent topology aligned to TNFD’s LEAP approach (Locate, Evaluate, Assess, Prepare) and biodiversity net gain (BNG) requirements.
2. Describe how the super agent consumes canonical entities/hierarchy from the carbon workflow, fuses them with Brain artefacts, and enriches data with geospatial datasets.
3. Specify subordinate utility agents, interfaces, outputs, and quality gates to ensure repeatable, auditable nature insights.

### Success Criteria
- Nature runs ingest boundary outputs + Brain context and produce: site inventory, dependency/impact matrices, risk/opportunity register, mitigation plan, and TNFD-ready disclosures.
- All outputs reference source artefacts, spatial datasets, and methodology versions for assurance.
- UI dashboards show progress per LEAP phase with live telemetry similar to carbon workflows.

## 3. Scope & Alignment
- **In scope:** TNFD-aligned assessments, BNG baseline calculations, water/stewardship signals, integration with carbon entities, and cross-domain alerts.
- **Out of scope:** deep ecological modeling, proprietary satellite feeds (future consideration), or carbon biodiversity offsets accounting.
- **Alignment:** supports the multi-domain vision (Vision/Strategy) and reuses orchestrator + Brain infrastructure defined in `context/ARCHITECTURE.md`.

## 4. Users & Stakeholders
- Sustainability and biodiversity leads needing structured nature risk/opportunity analyses.
- Carbon/account teams who depend on nature insights for integrated reporting.
- Product/engineering teams building UI dashboards and data pipelines.

## 5. Current State Snapshot
- `NatureExpertAgent` (Python) returns a deterministic placeholder summary (TNFD/BNG mention, recommendations) without data ingestion or validation.
- No dedicated pipelines for geospatial data, dependency/impact scoring, or BNG baselines.
- UI surfacing limited to simple cards in the results dashboard.

## 6. Proposed Nature Super Agent Architecture
### 6.1 LangGraph Structure
- **Supervisor node (`NatureSuperAgentSupervisor`)** orchestrates LEAP-inspired phases:
  1. *Locate* – map organisational boundary entities to physical sites with geocoding and sector classification.
  2. *Evaluate* – gather dependency/impact drivers via spatial overlays (protected areas, KBAs, water stress, biodiversity value).
  3. *Assess* – score risks/opportunities, determine materiality, and align to TNFD disclosure requirements.
  4. *Prepare* – recommend mitigation/monitoring actions, draft TNFD narrative, and surface alerts to other domains.
- Pauses for human review when risk scores exceed thresholds or data gaps remain unresolved.

### 6.2 Subordinate Utility Agents
1. **Site Inventory Agent** – consumes carbon entities, enriches with Brain artefacts, geocodes locations, and creates `site` records (lat/long, type, ownership, activity).
2. **Environmental Context Agent** – overlays sites with geospatial datasets (protected areas, WDPA, KBAs, water scarcity, ecoregions) using GIS tooling; stores provenance + overlap metrics.
3. **Dependency Analyzer** – identifies operational dependencies (water, land, ecosystem services) leveraging Brain content and sector heuristics.
4. **Impact Analyzer** – evaluates pressures/impacts (emissions, land use change, pollution) referencing activity data and external benchmarks.
5. **Risk Scoring Agent** – combines dependencies/impacts, exposure, and control effectiveness to compute TNFD risk levels with rationale.
6. **Opportunity & Mitigation Planner** – suggests actions (restoration, supplier engagement, data improvements), prioritised by impact and feasibility, linking back to carbon or supply-chain workflows.
7. **Reporting & Disclosure Agent** – compiles LEAP artifacts, TNFD-aligned narrative, BNG baseline summaries, and pushes to UI/object storage.

### 6.3 Data & Tooling
- Uses Brain-managed artefacts (reports, commitments) plus external geospatial datasets (WDPA, WRI Aqueduct, GBIF, GB BNG metrics) stored in object storage or via APIs.
- Graph DB stores relationships between entities, sites, ecosystems, risks, and mitigations.
- Vector store indexes site-level narratives for retrieval during analysis.
- Tool stack: GeoPandas/Shapely, rasterio, OSM/Google geocoding (with caching), QGIS-style processing scripts.

### 6.4 Outputs & Quality Gates
- **Outputs:**
  - `site_inventory.csv` with geocoded locations and metadata.
  - `dependency_impact_matrix.json` capturing driver scores per site.
  - `nature_risk_register.xlsx` with TNFD risk/opportunity entries, severity, owner, timeline.
  - `bnq_baseline_report.pdf` or markdown summarising baseline metrics and required enhancements.
  - Alerts and recommendations surfaced through `/v2/brain/insights` for cross-domain reuse.
- **Quality Gates:**
  - ≥95% of scoped facilities geocoded with confidence >0.8.
  - Dependencies and impacts scored for ≥90% of sites; unresolved cases flagged with next steps.
  - All risk statements cite at least one artefact or dataset reference.

## 7. Interfaces
- `/v2/sessions/{id}/domains/nature` – kickoff payload includes `{company_id, scope (TNFD/BNG), preferred datasets, priority geographies}`.
- `/v2/domains/nature` – metadata enumerating phases, inputs, outputs, prompts, tool contracts.
- `/v2/nature/runs/{id}` – exposes LEAP progress, telemetry, download links, approvals, alerts.
- WebSocket stream shares per-phase metrics (sites located, overlays processed, risk scores computed).

## 8. Implementation Plan
1. **P0 – Site Inventory Agent:** use existing entity data + Brain artefacts to build geocoding pipeline, store site records, expose API/exports.
2. **P0 – Environmental Context Agent:** integrate core spatial datasets (WDPA, Aqueduct, land cover) with caching + provenance logging.
3. **P1 – Dependency & Impact analyzers:** implement scoring heuristics + data persistence; add tests with sample companies.
4. **P1 – Risk Scoring & Mitigation Planner:** combine outputs, enforce TNFD materiality thresholds, integrate with learning engine for feedback.
5. **P2 – Reporting/Disclosure Agent + UI dashboards:** deliver TNFD narrative, BNG baseline, and cross-domain alerts.

## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Geospatial data licensing/restrictions | Blocker for overlays | Use open datasets (WDPA public, Aqueduct) initially; document licensing for commercial data.
| Incomplete site metadata | Poor geocoding accuracy | Feed Brain + carbon outputs to capture addresses; prompt users for missing info; store feedback.
| Computational load for spatial joins | Slow runs | Pre-tile datasets, cache overlays, use async workers.
| Lack of TNFD expertise | Misaligned outputs | Collaborate with SME advisors, encode frameworks in prompts/policies, run pilot reviews.
| Cross-domain inconsistency | Conflicting recommendations vs carbon | Share memory handles; add joint QA step comparing carbon + nature findings before final reporting.

## 10. Testing & Validation
- **Unit tests:** geocoding utilities, overlay calculations, scoring formulas, TNFD narrative generators.
- **Integration tests:** end-to-end run using fixture datasets; verify outputs, overlays, and API payloads.
- **Regression tests:** nightly run on sample company ensures dataset updates do not break scoring.
- **Performance tests:** simulate batches of sites to validate scaling.
- **User testing:** collect feedback from sustainability teams on risk registers and narratives; feed into learning engine.

## 11. Open Questions
1. Which geographies/datasets are mandatory for the first pilot (global vs region-specific)?
2. Do we require near-real-time satellite feeds, or can we rely on quarterly data refreshes for now?
3. How should we handle sensitive site information (e.g., endangered species locations) in multi-tenant deployments?
4. Should mitigation recommendations automatically create tasks in external systems (Jira, Asana) or stay within Nexus backlog?
5. How do we prioritise BNG vs water vs biodiversity use cases when presenting outputs to users?

---
Prepared by: *Codex Agent*  
Date: 2025-10-25  
References: `context/ARCHITECTURE.md`, `context/REQUIREMENTS.md`, `backend/app/agents/nature_expert.py`, TNFD LEAP guidance.
