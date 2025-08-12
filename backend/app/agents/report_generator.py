from __future__ import annotations

import asyncio
from typing import List, Dict, Any


class ReportGeneratorAgent:
    async def generate(
        self,
        *,
        entities: List[Dict[str, Any]],
        carbon: Dict[str, Any],
        pcf: Dict[str, Any],
        nature: Dict[str, Any],
    ) -> Dict[str, Any]:
        await asyncio.sleep(0.05)
        return {
            "executive_summary": {
                "overview": f"Analyzed {len(entities)} entities across {len({e.get('country') for e in entities if e.get('country')})} countries.",
                "highlights": [
                    carbon.get("summary"),
                    pcf.get("summary"),
                    nature.get("summary"),
                ],
            },
            "sections": {
                "entities": entities,
                "carbon": carbon,
                "pcf": pcf,
                "nature": nature,
            },
        }
