# Strategy

We will deliver value in three priority buckets, moving from a single utility agent to coordinated multi-agent workflows and finally to a self-improving system.

## Priority Bucket 1: Ship a focused utility agent (real users, real data)
Initial focus: Carbon Accounting – "Org Boundary & Structure" Agent.

### Problem it solves
- Many clients have fragmented organizational entities, legal structures, and reporting units across regions/functions
- Human consolidation is slow/error-prone; downstream accounting hinges on clean boundaries and mappings

### Inputs
- Client documents (org charts, ERP exports, legal entity registers, geography/location data)
- Prior reporting boundaries, methodology docs

### Core capabilities
- Consolidate entities into a reporting boundary aligned to GHG Protocol
- Identify data gaps, overlaps, inconsistencies; propose resolutions with rationale
- Produce: (a) consolidated Excel/CSV with canonical entity table and mappings, (b) short narrative explaining boundary decisions/assumptions, (c) recommendations and data-quality issues
- Collaborative UX: treat the user as a teammate; ask clarifying questions, propose next steps

### Success metrics (initial)
- Time-to-first-consolidated boundary (TTF-Boundary)
- % issues auto-identified and correctly resolved
- User satisfaction (explicit feedback), number of clarifying questions answered
- Audit readiness: completeness of lineage and assumptions

## Priority Bucket 2: Orchestrate utility agents under a Carbon Accounting Super Agent
Enable sequential and conditional handoffs across carbon-accounting tasks.

### Example chain
1) Org Boundary & Structure → 2) Activity Data Acquisition & Cleansing → 3) Emissions Calculation & Allocation → 4) QA/Controls → 5) Reporting Package

### Orchestration principles
- Clear agent contracts (inputs/outputs, schemas)
- Shared memory: vectorized artifacts, structured facts, and decision logs
- Supervisor/Super Agent policies for routing, retries, and dead-ends
- Human-in-the-loop checkpoints for material decisions

## Priority Bucket 3: Self-improving application
Build continuous learning loops that improve outcomes for both users and platform owners.

### For end users
- Implicit learning from accepted edits, explicit feedback signals
- Personalization to org context, sector, geography, regulations
- Retrieval/grounding tuned by relevance feedback

### For application owner (product telemetry)
- Task-level success/failure, reasons and fix patterns
- Embedding/data coverage heatmaps (what’s missing, what’s stale)
- Agent policy/version A/B comparisons; safe rollbacks
- Insights to prioritize new utility agents and data integrations

## Operating principles
- Start narrow, instrument deeply, expand confidently
- Gold-standard defaults; deviations require owner approval
- Documented agent interfaces and data contracts from day one
- Real-world pilots before broadening scope
