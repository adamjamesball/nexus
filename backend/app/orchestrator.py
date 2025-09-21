from __future__ import annotations

import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

from .agents.smart_document import SmartDocumentAgent
from .agents.entity_intel import EntityIntelligenceAgent
from .agents.carbon_expert import CarbonExpertAgent
from .agents.pcf_expert import PCFExpertAgent
from .agents.nature_expert import NatureExpertAgent
from .agents.report_generator import ReportGeneratorAgent
from .agents.org_boundary import OrgBoundaryAgent
from .agents.company_intelligence_real import RealCompanyIntelligenceAgent
import os
import pandas as pd
from .failure_logger import FailureLogger


@dataclass
class SessionState:
    session_id: str
    started_at: datetime = field(default_factory=datetime.utcnow)
    status: str = "idle"  # idle | running | complete | error
    progress: int = 0
    steps: List[Dict[str, Any]] = field(default_factory=list)
    results: Optional[Dict[str, Any]] = None
    errors: List[str] = field(default_factory=list)
    config: Dict[str, Any] = field(default_factory=dict)
    feedback: List[Dict[str, Any]] = field(default_factory=list)
    learning_signals: List[Dict[str, Any]] = field(default_factory=list)


class AgentOrchestrator:
    def __init__(self) -> None:
        self._sessions: Dict[str, SessionState] = {}
        # Initialize agents
        self.doc_agent = SmartDocumentAgent()
        self.entity_agent = EntityIntelligenceAgent()
        self.carbon_agent = CarbonExpertAgent()
        self.pcf_agent = PCFExpertAgent()
        self.nature_agent = NatureExpertAgent()
        self.report_agent = ReportGeneratorAgent()
        self.org_boundary_agent = OrgBoundaryAgent()
        self.company_intelligence_agent = RealCompanyIntelligenceAgent()
        self.failure_logger = FailureLogger()

    def _ensure_session(self, session_id: str) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id=session_id)
        return self._sessions[session_id]

    async def run_workflow(self, session_id: str, file_paths: List[str], use_ai: bool = True) -> None:
        state = self._ensure_session(session_id)
        state.status = "running"
        state.progress = 0
        state.steps.clear()
        state.results = None
        state.errors.clear()

        try:
            # Step 1: Parse documents
            state.steps.append({"name": "document_parsing", "status": "running"})
            parsed_docs = await self.doc_agent.parse_files(file_paths, session_id=session_id)
            doc_errors = [
                {
                    "file": os.path.basename(str(d.get("path"))),
                    "error": d.get("error"),
                    "hint": d.get("hint"),
                    "error_code": d.get("error_code"),
                }
                for d in parsed_docs
                if d.get("status") == "error"
            ]
            state.steps[-1].update({
                "status": "complete",
                "items": len(parsed_docs),
                "errors": doc_errors,
            })
            if parsed_docs and not any(d.get("status") == "ok" for d in parsed_docs):
                # No usable documents; mark as error with actionable guidance
                state.status = "error"
                state.errors.append("All uploaded files failed to parse. See step 'document_parsing' for details and hints.")
                # Log aggregate failure
                self.failure_logger.log(
                    session_id=session_id,
                    step="document_parsing",
                    file_path=None,
                    error_code="all_docs_failed",
                    message="No parsable documents in session",
                    hint="Upload valid CSV or .xlsx files. If using Excel, ensure it's a non-password protected .xlsx.",
                    extra={"files": [d.get("path") for d in parsed_docs]},
                )
                return
            state.progress = 20

            # Step 2: Org boundary consolidation (primary utility workflow)
            state.steps.append({"name": "org_boundary_consolidation", "status": "running"})
            org_boundary = await self.org_boundary_agent.consolidate(parsed_docs)
            state.steps[-1].update({
                "status": "complete",
                "entities": len(org_boundary.get("entities", [])),
                "issues": len(org_boundary.get("issues", [])),
                "hierarchy_links": len(org_boundary.get("hierarchy", [])),
            })
            state.progress = 45

            # Optional: Extract entities (secondary; can support other downstream steps)
            state.steps.append({"name": "entity_extraction", "status": "running"})
            entities = await self.entity_agent.extract_entities(parsed_docs, use_ai=use_ai)
            state.steps[-1].update({"status": "complete", "entities": len(entities)})
            state.progress = 55

            # Step 3: Carbon analysis
            state.steps.append({"name": "carbon_analysis", "status": "running"})
            carbon_summary = await self.carbon_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 65

            # Step 4: PCF analysis
            state.steps.append({"name": "pcf_analysis", "status": "running"})
            pcf_summary = await self.pcf_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 80

            # Step 5: Nature (TNFD/BNG) analysis
            state.steps.append({"name": "nature_analysis", "status": "running"})
            nature_summary = await self.nature_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 92

            # Step 6: Export generation (Excel outputs)
            state.steps.append({"name": "export_generation", "status": "running"})
            export_paths = self._write_exports(session_id, org_boundary)
            state.steps[-1].update({"status": "complete", "files": [os.path.basename(p) for p in export_paths]})
            state.progress = 96

            # Step 7: Report synthesis
            state.steps.append({"name": "report_generation", "status": "running"})
            report = await self.report_agent.generate(
                entities=entities,
                carbon=carbon_summary,
                pcf=pcf_summary,
                nature=nature_summary,
            )
            state.steps[-1].update({"status": "complete"})
            state.progress = 100

            state.results = {
                "entities": entities,
                "carbon": carbon_summary,
                "pcf": pcf_summary,
                "nature": nature_summary,
                "org_boundary": {
                    "summary": {
                        "num_entities": len(org_boundary.get("entities", [])),
                        "num_issues": len(org_boundary.get("issues", [])),
                        "num_hierarchy_links": len(org_boundary.get("hierarchy", [])),
                        "regions": sorted({e.get("region") for e in org_boundary.get("entities", []) if e.get("region")}),
                        "countries": sorted({e.get("country_code") for e in org_boundary.get("entities", []) if e.get("country_code")}),
                    },
                    "narrative": org_boundary.get("narrative"),
                    "recommendations": org_boundary.get("recommendations", []),
                    "issues": org_boundary.get("issues", []),
                    "hierarchy": org_boundary.get("hierarchy", []),
                    "exports": [os.path.basename(p) for p in export_paths],
                },
                "report": report,
            }
            state.status = "complete"

            # Record a learning signal for the run
            state.learning_signals.append({
                "event": "run_completed",
                "timestamp": datetime.utcnow().isoformat(),
                "metrics": {
                    "num_entities": len(entities),
                    "domains": ["carbon", "pcf", "nature"],
                },
            })
        except Exception as exc:  # noqa: BLE001
            state.status = "error"
            state.errors.append(str(exc))
            # Log crash for later analysis
            self.failure_logger.log(
                session_id=session_id,
                step="workflow",
                file_path=None,
                error_code="workflow_crash",
                message=str(exc),
                hint="Check server logs and input file formats.",
                exception=exc,
            )

    def _write_exports(self, session_id: str, org_boundary: Dict[str, Any]) -> List[str]:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sessions", session_id))
        exports_dir = os.path.join(base_dir, "exports")
        os.makedirs(exports_dir, exist_ok=True)

        exports = org_boundary.get("exports", {})
        entities_df = exports.get("entities_df")
        boundary_df = exports.get("boundary_df")
        issues_df = exports.get("issues_df")
        hierarchy_df = exports.get("hierarchy_df")

        paths: List[str] = []
        if entities_df is not None and isinstance(entities_df, pd.DataFrame):
            p = os.path.join(exports_dir, "consolidated_entities.xlsx")
            try:
                entities_df.to_excel(p, index=False)
                paths.append(p)
            except Exception as exc:  # noqa: BLE001
                # Log and fallback to CSV
                self.failure_logger.log(
                    session_id=session_id,
                    step="export_generation",
                    file_path=p,
                    error_code="excel_export_failed",
                    message="Failed to write consolidated_entities.xlsx; falling back to CSV",
                    hint="Ensure Excel writer dependency is installed and filesystem is writable.",
                    exception=exc,
                )
                p_csv = os.path.join(exports_dir, "consolidated_entities.csv")
                entities_df.to_csv(p_csv, index=False)
                paths.append(p_csv)
        if boundary_df is not None and isinstance(boundary_df, pd.DataFrame):
            p = os.path.join(exports_dir, "org_boundary.xlsx")
            try:
                boundary_df.to_excel(p, index=False)
                paths.append(p)
            except Exception as exc:  # noqa: BLE001
                self.failure_logger.log(
                    session_id=session_id,
                    step="export_generation",
                    file_path=p,
                    error_code="excel_export_failed",
                    message="Failed to write org_boundary.xlsx; falling back to CSV",
                    hint="Ensure Excel writer dependency is installed and filesystem is writable.",
                    exception=exc,
                )
                p_csv = os.path.join(exports_dir, "org_boundary.csv")
                boundary_df.to_csv(p_csv, index=False)
                paths.append(p_csv)
        if issues_df is not None and isinstance(issues_df, pd.DataFrame):
            p = os.path.join(exports_dir, "data_quality_issues.xlsx")
            try:
                issues_df.to_excel(p, index=False)
                paths.append(p)
            except Exception as exc:  # noqa: BLE001
                self.failure_logger.log(
                    session_id=session_id,
                    step="export_generation",
                    file_path=p,
                    error_code="excel_export_failed",
                    message="Failed to write data_quality_issues.xlsx; falling back to CSV",
                    hint="Ensure Excel writer dependency is installed and filesystem is writable.",
                    exception=exc,
                )
                p_csv = os.path.join(exports_dir, "data_quality_issues.csv")
                issues_df.to_csv(p_csv, index=False)
                paths.append(p_csv)
        if hierarchy_df is not None and isinstance(hierarchy_df, pd.DataFrame):
            p = os.path.join(exports_dir, "org_hierarchy.xlsx")
            try:
                hierarchy_df.to_excel(p, index=False)
                paths.append(p)
            except Exception as exc:  # noqa: BLE001
                self.failure_logger.log(
                    session_id=session_id,
                    step="export_generation",
                    file_path=p,
                    error_code="excel_export_failed",
                    message="Failed to write org_hierarchy.xlsx; falling back to CSV",
                    hint="Ensure Excel writer dependency is installed and filesystem is writable.",
                    exception=exc,
                )
                p_csv = os.path.join(exports_dir, "org_hierarchy.csv")
                hierarchy_df.to_csv(p_csv, index=False)
                paths.append(p_csv)
        # Also write a simple narrative/recommendations text
        narrative = org_boundary.get("narrative") or ""
        recs = org_boundary.get("recommendations", [])
        txt_path = os.path.join(exports_dir, "summary.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("Narrative:\n")
            f.write(narrative + "\n\n")
            f.write("Recommendations:\n")
            for r in recs:
                f.write(f"- {r}\n")
        paths.append(txt_path)
        return paths

    def get_status(self, session_id: str) -> Dict[str, Any]:
        state = self._ensure_session(session_id)
        return {
            "session_id": state.session_id,
            "status": state.status,
            "progress": state.progress,
            "steps": state.steps,
            "errors": state.errors,
        }

    def get_results(self, session_id: str) -> Optional[Dict[str, Any]]:
        state = self._ensure_session(session_id)
        return state.results

    def set_config(self, session_id: str, config: Dict[str, Any]) -> None:
        state = self._ensure_session(session_id)
        state.config = dict(config or {})

    def get_config(self, session_id: str) -> Dict[str, Any]:
        state = self._ensure_session(session_id)
        return state.config

    def get_domain_result(self, session_id: str, domain: str) -> Optional[Dict[str, Any]]:
        results = self.get_results(session_id) or {}
        domain = domain.lower()
        if domain == "carbon":
            return results.get("carbon")
        if domain == "pcf":
            return results.get("pcf")
        if domain in {"nature", "tnfd", "bng"}:
            return results.get("nature")
        if domain in {"entities"}:
            return {"entities": results.get("entities", [])}
        if domain in {"org", "org_boundary", "boundary"}:
            return results.get("org_boundary")
        return None

    def add_feedback(self, session_id: str, feedback: Dict[str, Any]) -> None:
        state = self._ensure_session(session_id)
        record = dict(feedback)
        record["timestamp"] = datetime.utcnow().isoformat()
        state.feedback.append(record)
        # Create a learning signal derived from feedback
        state.learning_signals.append({
            "event": "user_feedback",
            "timestamp": record["timestamp"],
            "agent": feedback.get("agent"),
            "type": feedback.get("type"),
        })

    def get_feedback(self, session_id: str) -> List[Dict[str, Any]]:
        state = self._ensure_session(session_id)
        return state.feedback

    def get_learning_signals(self, session_id: str) -> List[Dict[str, Any]]:
        state = self._ensure_session(session_id)
        return state.learning_signals
