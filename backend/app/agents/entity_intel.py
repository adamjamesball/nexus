from __future__ import annotations

import asyncio
from typing import List, Dict, Any
import os


class EntityIntelligenceAgent:
    async def extract_entities(self, parsed_docs: List[Dict[str, Any]], use_ai: bool = True) -> List[Dict[str, Any]]:
        entities: List[Dict[str, Any]] = []
        for doc in parsed_docs:
            await asyncio.sleep(0.05)
            if doc.get("status") != "ok":
                continue
            df = doc.get("dataframe")
            if df is None or df.empty:
                continue
            # Rule-based name column detection
            name_cols = [col for col in df.columns if any(k in col.lower() for k in ["name", "entity", "company", "organisation", "organization", "facility"])]
            if not name_cols:
                continue
            name_col = name_cols[0]
            for idx, row in df.iterrows():
                entity_name = str(row[name_col]).strip()
                if not entity_name or entity_name.lower() in {"nan", "none"}:
                    continue
                entity: Dict[str, Any] = {
                    "name": entity_name,
                    "source_file": os.path.basename(str(doc.get("path", ""))),
                    "source_row": int(idx) + 2,
                    "confidence": 0.9,
                    "is_user_verified": False,
                }
                for col in df.columns:
                    col_lower = str(col).lower()
                    value = row[col]
                    if pd_isna(value):
                        continue
                    if "country" in col_lower:
                        entity["country"] = str(value).strip().upper()[:2]
                    if "type" in col_lower:
                        entity["type"] = str(value).strip()
                    if "parent" in col_lower or "reports" in col_lower:
                        parent = str(value).strip()
                        if parent and parent.lower() not in {"nan", "none", ""}:
                            entity["parent"] = parent
                entities.append(entity)
        # Deduplicate by normalized name
        unique: Dict[str, Dict[str, Any]] = {}
        for e in entities:
            key = e["name"].lower().strip()
            if key not in unique:
                unique[key] = e
        return list(unique.values())


def pd_isna(value: Any) -> bool:
    try:
        import pandas as pd  # local import to avoid heavy global import cost
        return pd.isna(value)
    except Exception:
        return value is None
