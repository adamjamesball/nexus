from __future__ import annotations

import json
import os
import traceback
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional


def _default_failures_dir() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "failures"))
    os.makedirs(base, exist_ok=True)
    return base


@dataclass
class FailureRecord:
    timestamp: str
    session_id: Optional[str]
    step: Optional[str]
    file_path: Optional[str]
    error_code: str
    message: str
    hint: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class FailureLogger:
    """
    Lightweight JSONL-based failure logger.

    Records go to {repo}/backend/data/failures/failures.jsonl so they are visible
    to the orchestrator and can be inspected via API.
    """

    def __init__(self, directory: Optional[str] = None, filename: str = "failures.jsonl") -> None:
        self.directory = directory or _default_failures_dir()
        self.path = os.path.join(self.directory, filename)
        # Ensure directory exists
        os.makedirs(self.directory, exist_ok=True)

    def log(
        self,
        *,
        session_id: Optional[str],
        step: Optional[str],
        file_path: Optional[str],
        error_code: str,
        message: str,
        hint: Optional[str] = None,
        exception: Optional[BaseException] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        record = FailureRecord(
            timestamp=datetime.utcnow().isoformat(),
            session_id=session_id,
            step=step,
            file_path=file_path,
            error_code=error_code,
            message=message,
            hint=hint,
            details={
                **(extra or {}),
                "trace": traceback.format_exc() if exception is not None else None,
            },
        )
        try:
            with open(self.path, "a", encoding="utf-8") as f:
                f.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")
        except Exception:
            # Last-resort: avoid raising from logger
            pass

    def list(self, *, session_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        if not os.path.isfile(self.path):
            return []
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        obj = json.loads(line)
                    except Exception:
                        continue
                    if session_id is None or obj.get("session_id") == session_id:
                        items.append(obj)
        except Exception:
            return []
        return items[-limit:]


