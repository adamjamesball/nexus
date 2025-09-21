from __future__ import annotations

import asyncio
import os
import re
from collections import Counter, defaultdict
from typing import Any, Dict, Iterable, List, Optional, Tuple

import pandas as pd


class OrgBoundaryAgent:
    """Consolidate heterogeneous organisational spreadsheets into a canonical structure."""

    EMPTY_SENTINELS = {"", "nan", "none", "n/a", "na", "n.a", "null", "-", "—", "--", "tbd"}

    ID_CANDIDATES = [
        "facility id",
        "entity id",
        "site id",
        "company id",
        "org id",
        "organization id",
        "organisation id",
        "legal entity id",
        "location id",
        "identifier",
        "id",
    ]
    NAME_CANDIDATES = [
        "entity name",
        "facility name",
        "site name",
        "legal entity",
        "business unit",
        "company name",
        "division name",
        "organisation name",
        "organization name",
        "operating unit",
        "department",
        "name",
        "unit",
    ]
    PARENT_ID_CANDIDATES = [
        "parent id",
        "parent entity id",
        "parent facility id",
        "ultimate parent id",
        "upper id",
    ]
    PARENT_NAME_CANDIDATES = [
        "parent",
        "parent entity",
        "parent company",
        "parent name",
        "reports to",
        "reports_to",
        "holding company",
    ]
    REGION_CANDIDATES = [
        "region",
        "geo",
        "geography",
        "market",
        "area",
        "cluster",
    ]
    COUNTRY_CANDIDATES = [
        "country code",
        "country",
        "country/market",
        "jurisdiction",
        "location",
        "hq country",
        "nation",
    ]
    TYPE_CANDIDATES = [
        "facility type",
        "entity type",
        "category",
        "site type",
        "business type",
        "org type",
        "operating type",
    ]
    BUSINESS_UNIT_CANDIDATES = [
        "business unit",
        "business-unit",
        "business_unit",
        "segment",
        "division",
        "line of business",
        "lob",
    ]

    COUNTRY_NORMALIZATION_MAP: Dict[str, str] = {
        "albania": "AL",
        "algeria": "DZ",
        "argentina": "AR",
        "armenia": "AM",
        "australia": "AU",
        "azerbaijan": "AZ",
        "bahamas": "BS",
        "bangladesh": "BD",
        "barbados": "BB",
        "belarus": "BY",
        "belgium": "BE",
        "belize": "BZ",
        "benin": "BJ",
        "bhutan": "BT",
        "bolivia": "BO",
        "bosnia and herzegovina": "BA",
        "botswana": "BW",
        "brazil": "BR",
        "british indian ocean territory (chagos archipelago)": "IO",
        "british indian ocean territory": "IO",
        "brunei darussalam": "BN",
        "bulgaria": "BG",
        "burundi": "BI",
        "cameroon": "CM",
        "cape verde": "CV",
        "cayman islands": "KY",
        "central african republic": "CF",
        "chad": "TD",
        "christmas island": "CX",
        "colombia": "CO",
        "comoros": "KM",
        "congo": "CG",
        "costa rica": "CR",
        "croatia": "HR",
        "cyprus": "CY",
        "dominica": "DM",
        "dominican republic": "DO",
        "ecuador": "EC",
        "egypt": "EG",
        "el salvador": "SV",
        "eritrea": "ER",
        "estonia": "EE",
        "ethiopia": "ET",
        "faroe islands": "FO",
        "fiji": "FJ",
        "finland": "FI",
        "france": "FR",
        "french guiana": "GF",
        "french polynesia": "PF",
        "gabon": "GA",
        "gibraltar": "GI",
        "greenland": "GL",
        "grenada": "GD",
        "guadeloupe": "GP",
        "guatemala": "GT",
        "guinea": "GN",
        "guyana": "GY",
        "haiti": "HT",
        "holy see (vatican city state)": "VA",
        "holy see": "VA",
        "vatican city": "VA",
        "honduras": "HN",
        "india": "IN",
        "ireland": "IE",
        "isle of man": "IM",
        "italy": "IT",
        "jamaica": "JM",
        "japan": "JP",
        "jersey": "JE",
        "jordan": "JO",
        "korea": "KR",
        "kuwait": "KW",
        "kyrgyz republic": "KG",
        "kyrgyzstan": "KG",
        "lao people's democratic republic": "LA",
        "laos": "LA",
        "lebanon": "LB",
        "lesotho": "LS",
        "libyan arab jamahiriya": "LY",
        "libya": "LY",
        "luxembourg": "LU",
        "madagascar": "MG",
        "malawi": "MW",
        "marshall islands": "MH",
        "martinique": "MQ",
        "mauritius": "MU",
        "mexico": "MX",
        "monaco": "MC",
        "mongolia": "MN",
        "montserrat": "MS",
        "myanmar": "MM",
        "namibia": "NA",
        "niger": "NE",
        "nigeria": "NG",
        "northern mariana islands": "MP",
        "norway": "NO",
        "oman": "OM",
        "pakistan": "PK",
        "panama": "PA",
        "philippines": "PH",
        "portugal": "PT",
        "puerto rico": "PR",
        "reunion": "RE",
        "réunion": "RE",
        "romania": "RO",
        "russian federation": "RU",
        "russia": "RU",
        "rwanda": "RW",
        "saint barthelemy": "BL",
        "saint barthélemy": "BL",
        "saint helena": "SH",
        "saint kitts and nevis": "KN",
        "saint pierre and miquelon": "PM",
        "samoa": "WS",
        "san marino": "SM",
        "sao tome and principe": "ST",
        "são tomé and príncipe": "ST",
        "saudi arabia": "SA",
        "senegal": "SN",
        "seychelles": "SC",
        "singapore": "SG",
        "slovakia (slovak republic)": "SK",
        "slovakia": "SK",
        "slovenia": "SI",
        "somalia": "SO",
        "svalbard & jan mayen islands": "SJ",
        "svalbard and jan mayen islands": "SJ",
        "swaziland": "SZ",
        "eswatini": "SZ",
        "sweden": "SE",
        "switzerland": "CH",
        "syrian arab republic": "SY",
        "syria": "SY",
        "taiwan": "TW",
        "tanzania": "TZ",
        "timor-leste": "TL",
        "east timor": "TL",
        "togo": "TG",
        "tokelau": "TK",
        "turkey": "TR",
        "tuvalu": "TV",
        "uganda": "UG",
        "united arab emirates": "AE",
        "uae": "AE",
        "united states minor outlying islands": "UM",
        "united states of america": "US",
        "united states": "US",
        "usa": "US",
        "us": "US",
        "united kingdom": "GB",
        "uk": "GB",
        "great britain": "GB",
        "vanuatu": "VU",
        "venezuela": "VE",
        "vietnam": "VN",
        "yemen": "YE",
        "zambia": "ZM",
        "zimbabwe": "ZW",
    }

    canonical_columns = [
        "entity_id",
        "entity_identifier",
        "name",
        "display_name",
        "type",
        "region",
        "country_raw",
        "country_code",
        "business_unit",
        "division",
        "facility_type",
        "parent_id",
        "parent_name",
        "source_file",
        "source_sheet",
        "source_row",
        "confidence",
        "is_user_verified",
    ]

    async def consolidate(self, parsed_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        await asyncio.sleep(0.05)

        entities: List[Dict[str, Any]] = []
        issues: List[Dict[str, Any]] = []
        duplicate_ids: Dict[str, List[str]] = defaultdict(list)
        duplicate_names: Dict[str, List[str]] = defaultdict(list)
        missing_identifiers: List[Tuple[str, int]] = []
        non_iso_countries: Dict[str, List[str]] = defaultdict(list)
        unknown_countries: Dict[str, List[str]] = defaultdict(list)
        missing_regions: List[str] = []
        missing_types: List[str] = []

        for doc in parsed_docs:
            status = doc.get("status")
            path = str(doc.get("path"))
            sheet = doc.get("sheet_name") or "Sheet1"
            if status != "ok":
                issues.append(self._make_issue(
                    code="input_unusable",
                    message=doc.get("error") or "Input could not be parsed",
                    severity="error",
                    source_file=os.path.basename(path),
                    source_sheet=sheet,
                    recommendation="Re-export the sheet with a single header row and no merged cells",
                ))
                continue

            df = doc.get("dataframe")
            if df is None or df.empty:
                issues.append(self._make_issue(
                    code="empty_sheet",
                    message=f"{sheet} in {os.path.basename(path)} contained no tabular data",
                    severity="warning",
                    source_file=os.path.basename(path),
                    source_sheet=sheet,
                ))
                continue

            id_col = self._detect_column(df.columns, self.ID_CANDIDATES)
            name_col = self._detect_name_column(df.columns)
            parent_id_col = self._detect_column(df.columns, self.PARENT_ID_CANDIDATES)
            parent_name_col = self._detect_column(df.columns, self.PARENT_NAME_CANDIDATES)
            region_col = self._detect_column(df.columns, self.REGION_CANDIDATES)
            country_col = self._detect_column(df.columns, self.COUNTRY_CANDIDATES)
            type_col = self._detect_column(df.columns, self.TYPE_CANDIDATES)
            business_unit_col = self._detect_column(df.columns, self.BUSINESS_UNIT_CANDIDATES)

            if not name_col:
                issues.append(self._make_issue(
                    code="missing_name_column",
                    message=f"Could not detect an entity name column in {sheet} ({os.path.basename(path)})",
                    severity="error",
                    source_file=os.path.basename(path),
                    source_sheet=sheet,
                    recommendation="Add a column such as 'Facility Name' or 'Entity Name'",
                ))
                continue

            for idx, row in df.iterrows():
                entity_name = self._fetch_value(row, name_col)
                if not entity_name:
                    continue

                entity_identifier = self._fetch_value(row, id_col)
                parent_identifier = self._fetch_value(row, parent_id_col)
                parent_name = self._fetch_value(row, parent_name_col)
                region = self._fetch_value(row, region_col)
                country_raw = self._fetch_value(row, country_col)
                entity_type = self._fetch_value(row, type_col)
                business_unit = self._fetch_value(row, business_unit_col)
                division = self._detect_division(df.columns, row)
                facility_type = entity_type if entity_type else self._infer_type_from_name(entity_name)

                country_code, unmapped_country = self._normalize_country(country_raw)
                if unmapped_country:
                    unknown_countries[unmapped_country].append(entity_name)
                elif country_code and country_raw and country_raw.upper() != country_code:
                    non_iso_countries[country_raw].append(entity_name)

                if not region:
                    missing_regions.append(entity_name)
                if not facility_type:
                    missing_types.append(entity_name)

                entity_id = entity_identifier or self._make_entity_id(entity_name)
                if not entity_identifier:
                    missing_identifiers.append((entity_name, idx + 2))

                record = {
                    "entity_id": entity_id,
                    "entity_identifier": entity_identifier,
                    "name": entity_name,
                    "display_name": self._derive_display_name(entity_name, business_unit, division),
                    "type": facility_type or "Unknown",
                    "region": region,
                    "country_raw": country_raw,
                    "country_code": country_code,
                    "business_unit": business_unit,
                    "division": division,
                    "facility_type": facility_type,
                    "parent_id": parent_identifier,
                    "parent_name": parent_name,
                    "source_file": os.path.basename(path),
                    "source_sheet": sheet,
                    "source_row": int(idx) + 2,
                    "confidence": 0.92 if entity_identifier else 0.85,
                    "is_user_verified": False,
                }
                entities.append(record)

        deduped: Dict[str, Dict[str, Any]] = {}
        for entity in entities:
            key = entity["entity_id"].strip().lower()
            if key in deduped:
                duplicate_ids[entity["entity_id"]].append(entity["source_file"])
                continue
            deduped[key] = entity

        by_name: Dict[str, Dict[str, Any]] = {}
        for entity in deduped.values():
            name_key = entity["name"].strip().lower()
            if name_key in by_name:
                duplicate_names[entity["name"]].append(entity["source_file"])
            else:
                by_name[name_key] = entity

        entities_list = list(deduped.values())
        boundary, hierarchy_issues, hierarchy_edges = self._propose_boundary(entities_list)
        issues.extend(hierarchy_issues)

        issues.extend(self._compile_quality_issues(
            duplicate_ids,
            duplicate_names,
            missing_identifiers,
            unknown_countries,
            non_iso_countries,
            missing_regions,
            missing_types,
        ))

        entities_df = pd.DataFrame(entities_list)
        if entities_df.empty:
            entities_df = pd.DataFrame(columns=self.canonical_columns)
        else:
            for col in self.canonical_columns:
                if col not in entities_df.columns:
                    entities_df[col] = None
            entities_df = entities_df[self.canonical_columns]

        boundary_df = pd.DataFrame(boundary)
        if boundary_df.empty:
            boundary_df = pd.DataFrame(columns=["entity_id", "name", "in_boundary", "reason", "parent_id", "parent_name", "country_code", "region"])

        issues_df = pd.DataFrame(issues)
        if issues_df.empty:
            issues_df = pd.DataFrame(columns=["code", "message", "severity", "entity", "field", "source_file", "source_sheet", "source_row", "recommendation", "details"])

        hierarchy_df = pd.DataFrame(hierarchy_edges)
        if hierarchy_df.empty:
            hierarchy_df = pd.DataFrame(columns=["entity_id", "parent_id", "parent_name", "relationship"])

        narrative = self._generate_narrative(entities_list, boundary, issues)
        recommendations = self._generate_recommendations(issues)

        return {
            "entities": entities_list,
            "boundary": boundary,
            "hierarchy": hierarchy_edges,
            "narrative": narrative,
            "recommendations": recommendations,
            "issues": issues,
            "exports": {
                "entities_df": entities_df,
                "boundary_df": boundary_df,
                "issues_df": issues_df,
                "hierarchy_df": hierarchy_df,
            },
        }

    # ---- helper methods -------------------------------------------------

    def _detect_column(self, columns: Iterable[str], candidates: List[str]) -> Optional[str]:
        lowered = [str(col).strip().lower() for col in columns]
        for candidate in candidates:
            candidate_tokens = [tok for tok in re.split(r"[^a-z0-9]+", candidate) if tok]
            for idx, col in enumerate(lowered):
                col_tokens = set(tok for tok in re.split(r"[^a-z0-9]+", col) if tok)
                if all(tok in col_tokens for tok in candidate_tokens):
                    return list(columns)[idx]
        return None

    def _detect_name_column(self, columns: Iterable[str]) -> Optional[str]:
        columns_list = list(columns)
        lowered = [str(col).lower() for col in columns_list]
        for priority in [
            ["entity", "name"],
            ["facility", "name"],
            ["site", "name"],
            ["legal", "entity"],
        ]:
            for idx, col in enumerate(lowered):
                if all(token in col for token in priority):
                    return columns_list[idx]
        return self._detect_column(columns_list, self.NAME_CANDIDATES)

    def _detect_division(self, columns: Iterable[str], row: pd.Series) -> Optional[str]:
        division_columns = [
            col for col in columns if any(token in str(col).lower() for token in ["division", "dept", "department", "business line"])
        ]
        for col in division_columns:
            value = self._fetch_value(row, col)
            if value:
                return value
        return None

    def _fetch_value(self, row: pd.Series, column: Optional[str]) -> Optional[str]:
        if not column or column not in row.index:
            return None
        value = row[column]
        if pd.isna(value):
            return None
        text = str(value).strip()
        if text.lower() in self.EMPTY_SENTINELS:
            return None
        return text

    def _make_entity_id(self, name: str) -> str:
        normalized = re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")
        return f"ent-{abs(hash((normalized, len(name)))) % (10**10):010d}"

    def _derive_display_name(self, name: str, business_unit: Optional[str], division: Optional[str]) -> str:
        parts = [name]
        if business_unit and business_unit.lower() not in name.lower():
            parts.append(f"[{business_unit}]")
        if division and division.lower() not in name.lower():
            parts.append(f"[{division}]")
        return " ".join(parts)

    def _infer_type_from_name(self, name: str) -> Optional[str]:
        lowered = name.lower()
        if any(term in lowered for term in ["manufacturing", "plant", "factory"]):
            return "Manufacturing"
        if any(term in lowered for term in ["office", "hq", "headquarters"]):
            return "Office"
        if "distribution" in lowered:
            return "Distribution"
        return None

    def _normalize_country(self, value: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        if not value:
            return None, None
        val = str(value).strip()
        if not val:
            return None, None
        if len(val) == 2 and val.isalpha():
            return val.upper(), None

        val_lower = val.lower()
        if val_lower in self.COUNTRY_NORMALIZATION_MAP:
            return self.COUNTRY_NORMALIZATION_MAP[val_lower], None

        cleaned = re.sub(r"[^a-z ]", "", val_lower).strip()
        if cleaned in self.COUNTRY_NORMALIZATION_MAP:
            return self.COUNTRY_NORMALIZATION_MAP[cleaned], None

        return None, val

    def _propose_boundary(
        self,
        entities: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        issues: List[Dict[str, Any]] = []
        boundary: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        by_id = {e["entity_id"]: e for e in entities}
        by_name = {e["name"].strip().lower(): e for e in entities}

        for entity in entities:
            parent_id = entity.get("parent_id")
            parent_name = entity.get("parent_name")
            parent_missing = False

            if parent_id:
                parent_missing = parent_id not in by_id
            elif parent_name:
                parent_missing = parent_name.strip().lower() not in by_name

            if parent_missing:
                issues.append(self._make_issue(
                    code="missing_parent",
                    message=f"Parent reference for {entity['name']} could not be matched",
                    severity="warning",
                    entity=entity["name"],
                    field="parent",
                    source_file=entity.get("source_file"),
                    source_sheet=entity.get("source_sheet"),
                    source_row=entity.get("source_row"),
                    recommendation="Provide a matching parent row or confirm the entity is standalone",
                    details=[parent_id or parent_name],
                ))

            boundary.append({
                "entity_id": entity["entity_id"],
                "name": entity["name"],
                "in_boundary": True,
                "reason": "Included by default; refine with control & ownership inputs",
                "parent_id": parent_id,
                "parent_name": parent_name,
                "country_code": entity.get("country_code"),
                "region": entity.get("region"),
            })

            edges.append({
                "entity_id": entity["entity_id"],
                "parent_id": parent_id,
                "parent_name": parent_name,
                "relationship": "reports_to" if parent_id or parent_name else "root",
            })

        return boundary, issues, edges

    def _compile_quality_issues(
        self,
        duplicate_ids: Dict[str, List[str]],
        duplicate_names: Dict[str, List[str]],
        missing_identifiers: List[Tuple[str, int]],
        unknown_countries: Dict[str, List[str]],
        non_iso_countries: Dict[str, List[str]],
        missing_regions: List[str],
        missing_types: List[str],
    ) -> List[Dict[str, Any]]:
        compiled: List[Dict[str, Any]] = []

        if duplicate_ids:
            compiled.append(self._make_issue(
                code="duplicate_entity_id",
                message=f"Detected {len(duplicate_ids)} duplicate entity identifiers across uploads",
                severity="warning",
                recommendation="Ensure each facility or legal entity has a unique identifier before aggregation",
                details=[f"{entity_id}: {sorted(set(files))}" for entity_id, files in list(duplicate_ids.items())[:5]],
            ))

        if duplicate_names:
            compiled.append(self._make_issue(
                code="duplicate_entity_name",
                message=f"{len(duplicate_names)} entity names are repeated across files",
                severity="info",
                recommendation="Clarify whether repeated names represent distinct sites or duplicate entries",
                details=[f"{name}: {sorted(set(files))}" for name, files in list(duplicate_names.items())[:5]],
            ))

        if missing_identifiers:
            compiled.append(self._make_issue(
                code="missing_entity_identifier",
                message=f"{len(missing_identifiers)} rows are missing an explicit facility/entity identifier",
                severity="warning",
                recommendation="Provide a stable ID column (e.g., Facility ID) to support traceability",
                details=[f"{name} (row {row})" for name, row in missing_identifiers[:8]],
            ))

        if unknown_countries:
            total = sum(len(v) for v in unknown_countries.values())
            compiled.append(self._make_issue(
                code="country_normalization",
                message=f"{total} facilities use country values that could not be mapped to ISO-3166",
                severity="warning",
                recommendation="Standardize country inputs (e.g., use ISO alpha-2 codes or consistent names)",
                details=list(unknown_countries.keys())[:8],
            ))

        if non_iso_countries:
            total = sum(len(v) for v in non_iso_countries.values())
            compiled.append(self._make_issue(
                code="country_standardization",
                message=f"{total} facilities use verbose country labels; ISO-2 equivalents inferred",
                severity="info",
                recommendation="Store ISO-2 country codes alongside descriptive labels to prevent downstream ambiguity",
                details=list(non_iso_countries.keys())[:8],
            ))

        if missing_regions:
            compiled.append(self._make_issue(
                code="missing_region",
                message=f"{len(missing_regions)} facilities have no region assigned",
                severity="info",
                recommendation="Populate regional groupings (e.g., AMER, EMEA) to support roll-ups",
                details=missing_regions[:8],
            ))

        if missing_types:
            compiled.append(self._make_issue(
                code="missing_facility_type",
                message=f"{len(missing_types)} facilities are missing facility type information",
                severity="info",
                recommendation="Provide facility type (Manufacturing, Distribution, Office, etc.) for boundary governance",
                details=missing_types[:8],
            ))

        return compiled

    def _generate_narrative(
        self,
        entities: List[Dict[str, Any]],
        boundary: List[Dict[str, Any]],
        issues: List[Dict[str, Any]],
    ) -> str:
        if not entities:
            return "No entities could be consolidated from the supplied documents."

        country_codes = {e.get("country_code") for e in entities if e.get("country_code")}
        regions = {e.get("region") for e in entities if e.get("region")}
        facility_types = Counter(e.get("facility_type") for e in entities if e.get("facility_type"))
        warnings = sum(1 for issue in issues if issue.get("severity") == "warning")
        infos = sum(1 for issue in issues if issue.get("severity") == "info")
        errors = sum(1 for issue in issues if issue.get("severity") == "error")

        type_summary = ", ".join(f"{ftype}: {count}" for ftype, count in facility_types.most_common(3)) or "facility mix not yet classified"

        narrative_parts = [
            f"Consolidated {len(entities)} unique entities spanning {len(country_codes)} countries and {len(regions)} regions.",
            f"Top facility mix: {type_summary}.",
            "Initial boundary includes all entities; tune inclusion with ownership/control once supplied.",
            f"Data quality review flagged {errors} errors, {warnings} warnings, and {infos} informational notes.",
        ]
        return " ".join(narrative_parts)

    def _generate_recommendations(self, issues: List[Dict[str, Any]]) -> List[str]:
        recs = [
            "Provide ownership percentages and control type (financial vs operational) per entity",
            "Confirm reporting currency, consolidation method, and excluded entities with rationale",
            "Publish ISO-2 country codes alongside descriptive labels to unblock downstream analytics",
            "Upload latest legal entity register and org charts to improve hierarchical accuracy",
        ]
        issue_codes = {issue.get("code") for issue in issues}
        if "missing_entity_identifier" in issue_codes:
            recs.append("Introduce a stable Facility ID/Legal Entity ID column for every record before final boundary sign-off")
        if "duplicate_entity_id" in issue_codes:
            recs.append("Resolve duplicate identifiers to avoid double counting and misattribution in carbon ledgers")
        if "missing_parent" in issue_codes:
            recs.append("Review missing parent links and confirm whether affected entities are standalone or require hierarchy updates")
        if "missing_region" in issue_codes:
            recs.append("Populate a standard region field (e.g., AMER/EMEA/APAC) for aggregated sustainability reporting")
        return recs

    def _make_issue(
        self,
        code: str,
        message: str,
        severity: str,
        entity: Optional[str] = None,
        field: Optional[str] = None,
        source_file: Optional[str] = None,
        source_sheet: Optional[str] = None,
        source_row: Optional[int] = None,
        recommendation: Optional[str] = None,
        details: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        issue: Dict[str, Any] = {
            "code": code,
            "message": message,
            "severity": severity,
        }
        if entity:
            issue["entity"] = entity
        if field:
            issue["field"] = field
        if source_file:
            issue["source_file"] = source_file
        if source_sheet:
            issue["source_sheet"] = source_sheet
        if source_row is not None:
            issue["source_row"] = source_row
        if recommendation:
            issue["recommendation"] = recommendation
        if details:
            issue["details"] = details
        return issue
