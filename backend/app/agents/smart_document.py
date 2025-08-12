from __future__ import annotations

import asyncio
from typing import List, Dict, Any
import pandas as pd
import os


class SmartDocumentAgent:
    async def parse_files(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        # Simulate async parsing work
        results: List[Dict[str, Any]] = []
        for path in file_paths:
            await asyncio.sleep(0.05)
            ext = os.path.splitext(path)[1].lower()
            if ext in {".xlsx", ".xls"}:
                try:
                    df = pd.read_excel(path, engine="openpyxl")
                except Exception as exc:  # noqa: BLE001
                    results.append({"path": path, "status": "error", "error": str(exc)})
                    continue
                results.append({"path": path, "status": "ok", "dataframe": df})
            elif ext == ".csv":
                try:
                    df = pd.read_csv(path)
                except Exception as exc:  # noqa: BLE001
                    results.append({"path": path, "status": "error", "error": str(exc)})
                    continue
                results.append({"path": path, "status": "ok", "dataframe": df})
            else:
                results.append({"path": path, "status": "skipped", "reason": f"Unsupported extension: {ext}"})
        return results
