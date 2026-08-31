"""
Utility to collect and save raw OCR document samples for future NER annotation.
Saves document OCR pages, extracted record, and validation payload to data/ner/raw/<document_id>.json
and maintains data/ner/raw/manifest.json.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Union
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Base directory setup
TOOLS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = TOOLS_DIR.parent
RAW_DIR = BACKEND_DIR / "data" / "ner" / "raw"
MANIFEST_PATH = RAW_DIR / "manifest.json"


def _to_json_serializable(obj: Any) -> Any:
    """Helper to convert Pydantic objects or dicts into JSON-safe structures."""
    if isinstance(obj, BaseModel):
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        return obj.dict()
    elif isinstance(obj, dict):
        return {k: _to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_to_json_serializable(item) for item in obj]
    return obj


def save_raw_sample(
    document_id: str,
    filename: str,
    pages: List[Dict[str, Any]],
    record: Union[BaseModel, Dict[str, Any]],
    validation: Dict[str, Any]
) -> Path:
    """
    Saves a real processed document payload as a raw NER sample.

    Args:
        document_id: Unique document ID string.
        filename: Original file name.
        pages: List of page objects [{"page_number": int, "text": str}, ...]
        record: Extracted LandRecord (Pydantic model or dict).
        validation: Validation results dictionary.

    Returns:
        Path to the saved raw sample JSON file.
    """
    if not document_id:
        raise ValueError("document_id must be provided.")

    RAW_DIR.mkdir(parents=True, exist_ok=True)

    sample_filepath = RAW_DIR / f"{document_id}.json"

    # Convert Pydantic models to dicts while preserving full UTF-8 Marathi strings
    record_dict = _to_json_serializable(record)
    validation_dict = _to_json_serializable(validation)
    pages_list = _to_json_serializable(pages)

    payload = {
        "document_id": document_id,
        "filename": filename,
        "ocr_pages": pages_list,
        "extracted_record": record_dict,
        "validation": validation_dict
    }

    # Save document sample JSON
    with open(sample_filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    logger.info(f"Saved raw NER sample to {sample_filepath}")

    # Update dataset manifest
    _update_manifest(document_id, filename)

    return sample_filepath


def _update_manifest(document_id: str, filename: str) -> None:
    """Update or create manifest.json tracking collected raw samples."""
    manifest_data = {
        "total_samples": 0,
        "samples": []
    }

    if MANIFEST_PATH.exists():
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    manifest_data = json.loads(content)
        except Exception as e:
            logger.warning(f"Could not read existing manifest.json, re-initializing: {e}")

    samples_list = manifest_data.get("samples", [])

    # Check for existing document ID entry to prevent duplicates
    exists = any(item.get("document_id") == document_id for item in samples_list)

    if not exists:
        samples_list.append({
            "document_id": document_id,
            "filename": filename,
            "status": "raw",
            "annotated": False
        })

    manifest_data["samples"] = samples_list
    manifest_data["total_samples"] = len(samples_list)

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, ensure_ascii=False, indent=2)
