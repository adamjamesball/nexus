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
            parsed_docs = await self.doc_agent.parse_files(file_paths)
            state.steps[-1].update({"status": "complete", "items": len(parsed_docs)})
            state.progress = 20

            # Step 2: Extract entities
            state.steps.append({"name": "entity_extraction", "status": "running"})
            entities = await self.entity_agent.extract_entities(parsed_docs, use_ai=use_ai)
            state.steps[-1].update({"status": "complete", "entities": len(entities)})
            state.progress = 45

            # Step 3: Carbon analysis
            state.steps.append({"name": "carbon_analysis", "status": "running"})
            carbon_summary = await self.carbon_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 60

            # Step 4: PCF analysis
            state.steps.append({"name": "pcf_analysis", "status": "running"})
            pcf_summary = await self.pcf_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 75

            # Step 5: Nature (TNFD/BNG) analysis
            state.steps.append({"name": "nature_analysis", "status": "running"})
            nature_summary = await self.nature_agent.assess(entities)
            state.steps[-1].update({"status": "complete"})
            state.progress = 90

            # Step 6: Report synthesis
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
        if domain in {"entities", "org"}:
            return {"entities": results.get("entities", [])}
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
