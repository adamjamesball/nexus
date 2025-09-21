from __future__ import annotations

import os
import shutil
from typing import List

import pandas as pd
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


def _csv_inputs_dir() -> str:
	return os.path.join(
		REPO_ROOT,
		"frontend",
		"test-cases",
		"org-boundary-agent",
		"simple-hierarchy",
		"inputs",
	)


def _make_xlsx_inputs(tmp_dir: str) -> List[str]:
	csv_dir = _csv_inputs_dir()
	xlsx_paths: List[str] = []
	# Convert both CSVs to XLSX in temp directory
	for name in ("site-list-primary.csv", "org-chart-extract.csv"):
		csv_path = os.path.join(csv_dir, name)
		assert os.path.isfile(csv_path), f"Missing test input: {csv_path}"
		df = pd.read_csv(csv_path)
		xlsx_name = os.path.splitext(name)[0] + ".xlsx"
		xlsx_path = os.path.join(tmp_dir, xlsx_name)
		df.to_excel(xlsx_path, index=False)
		xlsx_paths.append(xlsx_path)
	# Use consistent order: site list first then org chart
	return sorted(xlsx_paths, key=lambda p: 0 if "site-list-primary" in p else 1)


@pytest.mark.asyncio
async def test_xlsx_parsing_and_consolidation(tmp_path) -> None:
	xlsx_files = _make_xlsx_inputs(str(tmp_path))
	doc_agent = SmartDocumentAgent()
	parsed = await doc_agent.parse_files(xlsx_files)
	assert all(d.get("status") == "ok" for d in parsed)

	agent = OrgBoundaryAgent()
	result = await agent.consolidate(parsed)
	entities = result.get("entities", [])
	assert len(entities) == 3
	names = sorted(e.get("name") for e in entities)
	assert names == [
		"GreenTech Industries Inc.",
		"GreenTech Manufacturing LLC",
		"GreenTech Solar Division",
	]
	hierarchy = result.get("hierarchy") or []
	assert len(hierarchy) == len(entities)


@pytest.mark.asyncio
async def test_xlsx_orchestrator_exports(tmp_path) -> None:
	xlsx_files = _make_xlsx_inputs(str(tmp_path))
	orchestrator = AgentOrchestrator()
	session_id = "test-session-xlsx"
	await orchestrator.run_workflow(session_id, xlsx_files, use_ai=False)
	results = orchestrator.get_results(session_id)
	assert results is not None
	org_boundary = results.get("org_boundary") or {}
	assert (org_boundary.get("summary") or {}).get("num_entities") == 3

	exports_dir = os.path.join(BACKEND_DIR, "data", "sessions", session_id, "exports")
	expected = {
		"consolidated_entities.xlsx",
		"org_boundary.xlsx",
		"org_hierarchy.xlsx",
		"data_quality_issues.xlsx",
		"summary.txt",
	}
	present = set(os.listdir(exports_dir)) if os.path.isdir(exports_dir) else set()
	missing = expected - present
	assert not missing, f"Missing exports: {missing}"

	# Cleanup
	shutil.rmtree(os.path.join(BACKEND_DIR, "data", "sessions", session_id), ignore_errors=True)


@pytest.mark.asyncio
async def test_multisheet_and_ambiguous_columns(tmp_path) -> None:
	workbook_path = os.path.join(tmp_path, "ambiguous_org.xlsx")
	with pd.ExcelWriter(workbook_path, engine="openpyxl") as writer:
		pd.DataFrame(
			{
				"Facility ID": ["F-001", "F-002"],
				"Site Name": ["Northern Plant", "South Logistics"],
				"Country": ["United States of America", "France"],
				"Region": ["AMER", "EMEA"],
				"Facility Type": ["Manufacturing", "Distribution"],
				"Parent Facility ID": ["HOLD-01", "REG-999"],
			},
		).to_excel(writer, sheet_name="Operations", index=False)
		pd.DataFrame(
			{
				"Org ID": ["HOLD-01"],
				"Organisation Name": ["Global Holdings"],
				"Country/Market": ["United Kingdom"],
				"Reports To": [None],
			},
		).to_excel(writer, sheet_name="Holdings", index=False)

	doc_agent = SmartDocumentAgent()
	parsed = await doc_agent.parse_files([workbook_path])
	usable = [doc for doc in parsed if doc.get("status") == "ok"]
	assert len(usable) == 2, "Both sheets should be ingested"

	agent = OrgBoundaryAgent()
	result = await agent.consolidate(parsed)
	entities = result.get("entities", [])
	assert len(entities) == 3
	entity_ids = {e["entity_id"] for e in entities}
	assert {"HOLD-01", "F-001", "F-002"} <= entity_ids
	issues = result.get("issues", [])
	issue_codes = {issue.get("code") for issue in issues}
	assert "country_standardization" in issue_codes
	assert any(issue.get("code") == "missing_parent" for issue in issues), "Hierarchy gaps should be flagged"
	hierarchy = result.get("hierarchy") or []
	assert any(edge.get("parent_id") == "HOLD-01" for edge in hierarchy if edge.get("entity_id") == "F-001")
