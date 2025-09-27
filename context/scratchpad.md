# Scratchpad

- 2025-02-24: Updated docs dev server to port 4100 to avoid conflicts with 300x range and adjusted frontend link accordingly. Terminated lingering dev processes on ports 3001/3003/8000 to recycle ports before restarting.
- 2025-02-24: Improved org boundary start flow diagnostics by surfacing API error details, wiring session failure logs into the dashboard, and adding client-side handling for cleaner messaging.
- 2025-02-24: Fixed org boundary start call to hit `/sessions/{id}/process` with `use_ai` payload so workflow triggers correctly and defaulted frontend API base URL to `http://localhost:8000` when env is unset.
- 2025-02-24: Added `@radix-ui/react-tabs` dependency to unblock config tabs UI; remember lint/build commands still fail due to pre-existing ESLint configuration and agent page type issues.
- 2025-02-24: Refreshed results dashboard styling (dark theme text, summary-first layout, agent progress timeline, org-boundary-only content) per UI feedback. Added session diagnostics toggles/copy-id in org boundary flow to expose backend failure logs.
- 2025-02-25: Wired company intelligence endpoints into onboarding (profile search, document discovery, magic moment) with env-configurable API base, backend health checks, and regression tests for LLaMA3-backed fallback flows.
- 2025-02-25: Rebuilt agent configuration inspector, normalized API contract to backend, exposed workflow/prompt/tooling detail in config pages, and removed Google font dependency to unblock offline builds.
