# Repository Guidelines

## Important rules
So we have a number of important rules for this project. First off, you should always ensure that you have awareness of what the project is trying to achieve. So look in the context folder where we have a vision strategy requirement and architecture document. All of our features should be built with the architecture in mind. No changes to the overall architecture should be made without prior express permission from the user. When building features, think deeply first, plan the approach, ensure it's consistent and aligns with our wider vision and strategy. You should update the requirements document as we go along, marking certain features as complete. You should also have a scratch pad document in the context folder, so a scratchpad.md. If it doesn't exist, create it. All features should have appropriate unit tests, regression tests, integration tests, etc. All features must be tested before going back to the user for manual testing. It's highly important that this is done. If you're unsure about what success looks like, get the user to clarify what this is.

## Project Structure & Module Organization
The codebase separates backend, frontend, and reference docs. `backend/app` hosts the FastAPI orchestrator with `agents/` for behaviors, `intelligence/` for analytics, and `processing/` for ingest; configuration lives in `config.py`. Tests reside in `backend/tests`. The Next.js client lives under `frontend/src/app` with shared UI in `components/`. Strategy briefs sit in `/context`. Run `scripts/smoke.sh` for an end-to-end sanity check.

## Build, Test, and Development Commands
Install backend dependencies with `npm run backend:install`, which creates `.venv`. Use `npm run dev` to start uvicorn on :8000 and Next.js on :3002 simultaneously. Run services individually with `./.venv/bin/uvicorn app.main:app --app-dir backend --reload` or `npm --prefix frontend run dev`. Build everything with `docker compose up --build`, or build the frontend alone via `npm --prefix frontend run build`. Verify wiring with `npm run smoke`.

## Coding Style & Naming Conventions
Target Python 3.10+, four-space indentation, snake_case modules, PascalCase classes, and type hints on new entry points. Run `ruff check backend/app backend/tests` (and `ruff format` when touching multiple files) before committing. Frontend code uses TypeScript + Tailwind; keep components PascalCase, hooks/utilities camelCase, route folders dashed, and group Tailwind classes from layout to color. Execute `npm --prefix frontend run lint` and `npm --prefix frontend run type-check` ahead of review.

## Testing Guidelines
Backend tests rely on pytest/pytest-asyncio; activate the virtualenv and run `pytest backend/tests`. Name suites `test_<topic>.py` and cover orchestrator flows, failure logging, and deterministic agent outputs with fixtures. Frontend testing uses Jest + Testing Library via `npm --prefix frontend run test`; colocate `.test.tsx` files and mock APIs with MSW stubs from `src/mocks`. Run `npm --prefix frontend run test:coverage` before merging major UI work.

## Commit & Pull Request Guidelines
Write commits with imperative subjects (e.g., `Add carbon agent baseline`) and isolate backend versus frontend changes when practical; explain cross-layer impacts in the body. Pull requests should include a concise summary, linked issues or briefs, manual checks (lint, type-check, pytest, smoke), and visuals for UI updates. Request review only after these checks pass.

## Environment & Agent Configuration
Copy `frontend/.env.local.sample` to `.env.local`, set `NEXT_PUBLIC_API_URL`, and toggle `NEXT_PUBLIC_USE_MOCKS=true` when exercising MSW fixtures. Backend services read environment variables for providers such as Redis—never commit secrets. Register new agents in `backend/app/agents`, update scheduling in `orchestrator.py`, and expose metadata through `/v2/domains` so the frontend catalog stays current.

