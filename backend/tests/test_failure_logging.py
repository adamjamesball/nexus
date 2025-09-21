from __future__ import annotations

import os
import uuid
import shutil

import pytest

# Ensure backend/app is importable
THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, ".."))
import sys  # noqa: E402

if BACKEND_DIR not in sys.path:
	sys.path.insert(0, BACKEND_DIR)

from app.agents.smart_document import SmartDocumentAgent  # noqa: E402
from app.failure_logger import FailureLogger  # noqa: E402


@pytest.mark.asyncio
async def test_unsupported_xls_logs_failure_and_guidance(tmp_path) -> None:
	# Create a dummy legacy .xls file (content not read due to early guard)
	legacy_xls = os.path.join(str(tmp_path), "legacy.xls")
	with open(legacy_xls, "wb") as f:
		f.write(b"\x00\x00")

	session_id = f"test-{uuid.uuid4()}"
	doc_agent = SmartDocumentAgent()
	parsed = await doc_agent.parse_files([legacy_xls], session_id=session_id)
	assert len(parsed) == 1
	rec = parsed[0]
	assert rec.get("status") == "error"
	assert rec.get("error_code") == "excel_xls_unsupported"
	assert "Save as .xlsx" in (rec.get("error") or "") or "Save as .xlsx" in (rec.get("hint") or "")

	# Verify failure is recorded
	logger = FailureLogger()
	records = logger.list(session_id=session_id)
	assert any(r.get("error_code") == "excel_xls_unsupported" for r in records)


