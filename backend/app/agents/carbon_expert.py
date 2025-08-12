from __future__ import annotations

import asyncio
from typing import List, Dict, Any


class CarbonExpertAgent:
    async def assess(self, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Placeholder deterministic summary aligned to GHG Protocol scopes
        await asyncio.sleep(0.1)
        num_entities = len(entities)
        countries = sorted({e.get("country") for e in entities if e.get("country")})
        return {
            "summary": "Carbon assessment baseline",
            "ghg_protocol_alignment": True,
            "entities_analyzed": num_entities,
            "geographies": countries,
            "recommendations": [
                "Collect activity data for Scope 1 stationary and mobile combustion",
                "Gather purchased electricity data for Scope 2 by site",
                "Map supplier categories for Scope 3 screening",
            ],
        }
