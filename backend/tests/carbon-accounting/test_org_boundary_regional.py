from __future__ import annotations

import os
import shutil
from pathlib import Path

import pytest

THIS_DIR = Path(__file__).parent
BACKEND_DIR = THIS_DIR.parents[1]

import sys

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.orchestrator import AgentOrchestrator  # noqa: E402


@pytest.mark.asyncio
async def test_regional_org_boundary_workflow(tmp_path) -> None:
    sample_dir = THIS_DIR / "org-boundary"
    file_paths = sorted(str(p) for p in sample_dir.glob("org_structure_*.xlsx"))
    assert file_paths, "Expected regional org structure XLSX inputs"

    session_id = "test-org-boundary-regional"
    orchestrator = AgentOrchestrator()

    await orchestrator.run_workflow(session_id, file_paths, use_ai=False)

    results = orchestrator.get_results(session_id)
    assert results is not None
    org_boundary = results.get("org_boundary") or {}
    summary = org_boundary.get("summary") or {}
    assert summary.get("num_entities") == 200
    assert summary.get("num_hierarchy_links") == 200
    assert summary.get("regions"), "Expected consolidated regions metadata"

    issues = org_boundary.get("issues") or []
    issue_codes = {issue.get("code") for issue in issues if isinstance(issue, dict)}
    assert {"country_standardization"} <= issue_codes

    exports_dir = BACKEND_DIR / "data" / "sessions" / session_id / "exports"
    expected_exports = {
        "consolidated_entities.xlsx",
        "org_boundary.xlsx",
        "org_hierarchy.xlsx",
        "data_quality_issues.xlsx",
        "summary.txt",
    }
    present = {p.name for p in exports_dir.iterdir()} if exports_dir.exists() else set()
    missing = expected_exports - present
    assert not missing, f"Missing exports: {missing}"

    shutil.rmtree(BACKEND_DIR / "data" / "sessions" / session_id, ignore_errors=True)
