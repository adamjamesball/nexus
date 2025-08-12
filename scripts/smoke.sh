#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test: start backend (bg), hit health, create session, then stop

VENV_DIR=".venv"
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/pip" install -r backend/requirements.txt >/dev/null

"$VENV_DIR/bin/uvicorn" app.main:app --app-dir backend --host 0.0.0.0 --port 8000 &
PID=$!

cleanup() {
  kill $PID >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 3

curl -sf http://127.0.0.1:8000/health >/dev/null || { echo "Health check failed"; exit 1; }

SESSION=$(curl -sf -X POST http://localhost:8000/v2/sessions | python3 -c 'import sys,json; print(json.load(sys.stdin)["session_id"])')
[ -n "$SESSION" ] || { echo "Create session failed"; exit 1; }

echo "Smoke OK: session $SESSION"
