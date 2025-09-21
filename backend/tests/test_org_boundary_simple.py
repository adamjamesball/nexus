from __future__ import annotations

import asyncio
import os
import shutil
from typing import List

import pytest


# Ensure backend/app is importable
THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, ".."))
REPO_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
import sys  # noqa: E402

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.agents.smart_document import SmartDocumentAgent  # noqa: E402
from app.agents.org_boundary import OrgBoundaryAgent  # noqa: E402
from app.orchestrator import AgentOrchestrator  # noqa: E402


def _simple_hierarchy_input_paths() -> List[str]:
    inputs_dir = os.path.join(
        REPO_ROOT,
        "frontend",
        "test-cases",
        "org-boundary-agent",
        "simple-hierarchy",
        "inputs",
    )
    org_chart = os.path.join(inputs_dir, "org-chart-extract.csv")
    site_list = os.path.join(inputs_dir, "site-list-primary.csv")
    assert os.path.isfile(org_chart), f"Missing test input: {org_chart}"
    assert os.path.isfile(site_list), f"Missing test input: {site_list}"
    # Use a consistent order: site list first, then org chart
    return [site_list, org_chart]


@pytest.mark.asyncio
async def test_org_boundary_agent_consolidate_simple_hierarchy() -> None:
    file_paths = _simple_hierarchy_input_paths()

    doc_agent = SmartDocumentAgent()
    parsed_docs = await doc_agent.parse_files(file_paths)

    # Sanity: both CSVs parsed successfully
    assert all(d.get("status") == "ok" for d in parsed_docs), f"Parse errors: {parsed_docs}"

    agent = OrgBoundaryAgent()
    result = await agent.consolidate(parsed_docs)

    entities = result.get("entities", [])
    boundary = result.get("boundary", [])
    issues = result.get("issues", [])

    # Primary checks
    assert len(entities) == 3, f"Expected 3 entities, got {len(entities)}: {[e.get('name') for e in entities]}"
    assert len(boundary) == 3, f"Expected 3 boundary entries, got {len(boundary)}"
    hierarchy = result.get("hierarchy") or []
    assert len(hierarchy) == 3, "Each entity should appear in the hierarchy graph"

    names = sorted([e.get("name") for e in entities])
    assert names == [
        "GreenTech Industries Inc.",
        "GreenTech Manufacturing LLC",
        "GreenTech Solar Division",
    ], f"Unexpected entity names: {names}"

    # Should not flag missing parents in this clean dataset
    assert not any((issue or {}).get("code") == "missing_parent" for issue in issues), f"Unexpected parent-related issues: {issues}"

    narrative: str = result.get("narrative") or ""
    assert "Consolidated 3 unique entities" in narrative


@pytest.mark.asyncio
async def test_orchestrator_generates_exports_for_simple_hierarchy(tmp_path) -> None:
    file_paths = _simple_hierarchy_input_paths()

    # Use a unique session id and ensure session data dir exists for exports
    session_id = "test-session-simple"

    orchestrator = AgentOrchestrator()

    # Run the full workflow (document parsing → boundary → analysis → exports)
    await orchestrator.run_workflow(session_id, file_paths, use_ai=False)

    results = orchestrator.get_results(session_id)
    assert results is not None, "Results should be available after workflow completes"

    org_boundary = results.get("org_boundary") or {}
    summary = (org_boundary.get("summary") or {})
    assert summary.get("num_entities") == 3

    # Validate exports exist on disk
    # Exports are written under backend/data/sessions/<session_id>/exports
    exports_dir = os.path.join(BACKEND_DIR, "data", "sessions", session_id, "exports")
    expected_files = {
        "consolidated_entities.xlsx",
        "org_boundary.xlsx",
        "org_hierarchy.xlsx",
        "data_quality_issues.xlsx",
        "summary.txt",
    }
    present = set(os.listdir(exports_dir)) if os.path.isdir(exports_dir) else set()
    missing = expected_files - present
    assert not missing, f"Missing expected export files: {missing} in {exports_dir}"

    # Cleanup artifacts for idempotent test runs
    shutil.rmtree(os.path.join(BACKEND_DIR, "app", "data", "sessions", session_id), ignore_errors=True)
