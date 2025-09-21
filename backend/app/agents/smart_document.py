from __future__ import annotations

import asyncio
from typing import List, Dict, Any, Optional
import pandas as pd
import os
from app.failure_logger import FailureLogger


def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize sheet data by dropping empty rows/cols and fixing placeholder headers."""
    working = df.copy()

    # Drop fully empty rows/columns
    working.dropna(axis=0, how="all", inplace=True)
    working.dropna(axis=1, how="all", inplace=True)

    if working.empty:
        return working

    # If headers are unnamed but first row has values, treat first row as header
    if all(str(col).startswith("Unnamed") for col in working.columns):
        header_row = working.iloc[0].fillna("")
        working = working.iloc[1:]
        working.columns = [str(val).strip() or f"column_{idx}" for idx, val in enumerate(header_row)]

    # Normalize column names by stripping whitespace
    working.columns = [str(col).strip() for col in working.columns]

    # Ensure index is simple range
    working.reset_index(drop=True, inplace=True)

    return working


class SmartDocumentAgent:
    def __init__(self) -> None:
        self._failure_logger = FailureLogger()

    async def parse_files(self, file_paths: List[str], session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        # Simulate async parsing work
        results: List[Dict[str, Any]] = []
        for path in file_paths:
            await asyncio.sleep(0.05)
            ext = os.path.splitext(path)[1].lower()
            if ext == ".xlsx":
                try:
                    workbook = pd.read_excel(path, engine="openpyxl", sheet_name=None)
                except ModuleNotFoundError as exc:  # openpyxl not installed
                    message = "Excel support requires 'openpyxl'. Please install it or upload CSV."
                    hint = "Install dependency: pip install openpyxl. Or save the file as CSV and re-upload."
                    self._failure_logger.log(
                        session_id=session_id,
                        step="document_parsing",
                        file_path=path,
                        error_code="excel_openpyxl_missing",
                        message=message,
                        hint=hint,
                        exception=exc,
                        extra={"extension": ext},
                    )
                    results.append({
                        "path": path,
                        "status": "error",
                        "error": message,
                        "hint": hint,
                        "error_code": "excel_openpyxl_missing",
                    })
                    continue
                except Exception as exc:  # noqa: BLE001
                    message = f"Could not read Excel file: {os.path.basename(path)}"
                    hint = "Ensure the file is a valid .xlsx (not password-protected or corrupted). Try saving again."
                    self._failure_logger.log(
                        session_id=session_id,
                        step="document_parsing",
                        file_path=path,
                        error_code="excel_parse_error",
                        message=message,
                        hint=hint,
                        exception=exc,
                        extra={"extension": ext},
                    )
                    results.append({
                        "path": path,
                        "status": "error",
                        "error": message,
                        "hint": hint,
                        "error_code": "excel_parse_error",
                    })
                    continue

                if not isinstance(workbook, dict):
                    workbook = {"Sheet1": workbook}

                for sheet_name, sheet_df in workbook.items():
                    cleaned = _clean_dataframe(sheet_df)
                    metadata = {
                        "sheet_name": sheet_name,
                        "columns": [str(col) for col in cleaned.columns],
                        "row_count": int(cleaned.shape[0]),
                    }
                    status = "ok" if not cleaned.empty else "empty"
                    entry = {
                        "path": path,
                        "status": status,
                        "dataframe": cleaned,
                        "metadata": metadata,
                        "sheet_name": sheet_name,
                    }
                    if status != "ok":
                        entry["error"] = "Sheet contained no tabular data after cleaning"
                        entry["error_code"] = "sheet_empty"
                    results.append(entry)
            elif ext == ".xls":
                # Explicit guidance for legacy XLS
                message = "Legacy .xls format is not supported. Save as .xlsx or CSV and re-upload."
                hint = "Open the file in Excel or LibreOffice and 'Save As' .xlsx, then try again."
                self._failure_logger.log(
                    session_id=session_id,
                    step="document_parsing",
                    file_path=path,
                    error_code="excel_xls_unsupported",
                    message=message,
                    hint=hint,
                    extra={"extension": ext},
                )
                results.append({
                    "path": path,
                    "status": "error",
                    "error": message,
                    "hint": hint,
                    "error_code": "excel_xls_unsupported",
                })
            elif ext == ".csv":
                try:
                    df = pd.read_csv(path)
                except Exception as exc:  # noqa: BLE001
                    message = f"Could not read CSV file: {os.path.basename(path)}"
                    hint = "Check delimiter, encoding (UTF-8), and that the file is not empty."
                    self._failure_logger.log(
                        session_id=session_id,
                        step="document_parsing",
                        file_path=path,
                        error_code="csv_parse_error",
                        message=message,
                        hint=hint,
                        exception=exc,
                        extra={"extension": ext},
                    )
                    results.append({
                        "path": path,
                        "status": "error",
                        "error": message,
                        "hint": hint,
                        "error_code": "csv_parse_error",
                    })
                    continue
                cleaned = _clean_dataframe(df)
                metadata = {
                    "sheet_name": "CSV",
                    "columns": [str(col) for col in cleaned.columns],
                    "row_count": int(cleaned.shape[0]),
                }
                status = "ok" if not cleaned.empty else "empty"
                entry = {
                    "path": path,
                    "status": status,
                    "dataframe": cleaned,
                    "metadata": metadata,
                    "sheet_name": "CSV",
                }
                if status != "ok":
                    entry["error"] = "CSV contained no tabular data after cleaning"
                    entry["error_code"] = "csv_empty"
                results.append(entry)
            else:
                results.append({"path": path, "status": "skipped", "reason": f"Unsupported extension: {ext}"})
        return results
