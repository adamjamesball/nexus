from __future__ import annotations

import asyncio
from typing import List, Dict, Any


class NatureExpertAgent:
    async def assess(self, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        # TNFD/BNG placeholder summary
        await asyncio.sleep(0.1)
        sites = [e for e in entities if e.get("type", "").lower() in {"facility", "site", "plant"}]
        return {
            "summary": "Nature risk and opportunity baseline",
            "frameworks": ["TNFD", "BNG"],
            "sites_considered": len(sites),
            "recommendations": [
                "Screen sites against protected areas and KBAs",
                "Assess dependencies on water and land",
                "Plan BNG metrics and habitat baselines where applicable",
            ],
        }
