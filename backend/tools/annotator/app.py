"""
FastAPI Local NER Annotation Web Server for Doc2Digital.
Provides endpoints and UI for human annotation of raw OCR samples.
"""

import json
import re
import sys
import uvicorn
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Setup directory paths relative to backend root
ANNOTATOR_DIR = Path(__file__).resolve().parent
TOOLS_DIR = ANNOTATOR_DIR.parent
BACKEND_DIR = TOOLS_DIR.parent

sys.path.insert(0, str(BACKEND_DIR))

from tools.validate_ner_dataset import validate_example, validate_dataset, ALLOWED_LABELS
from tools.create_ner_sample import save_to_jsonl

RAW_DIR = BACKEND_DIR / "data" / "ner" / "raw"
MANIFEST_PATH = RAW_DIR / "manifest.json"
DATASET_PATH = BACKEND_DIR / "data" / "ner" / "land_records.jsonl"
TEMPLATES_DIR = ANNOTATOR_DIR / "templates"

app = FastAPI(title="Doc2Digital Local NER Annotator")


def sanitize_document_id(doc_id: str) -> str:
    """Ensure document_id contains only alphanumeric characters, dashes, and underscores."""
    if not doc_id or not re.match(r"^[a-zA-Z0-9_\-]+$", doc_id):
        raise HTTPException(status_code=400, detail="Invalid document_id format.")
    return doc_id


@app.get("/", response_class=HTMLResponse)
async def get_ui():
    """Serve the local annotation HTML user interface."""
    index_file = TEMPLATES_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=444, detail="UI Template index.html not found.")
    with open(index_file, "r", encoding="utf-8") as f:
        return f.read()


@app.get("/api/samples")
async def list_samples():
    """List raw samples tracked in manifest.json."""
    if not MANIFEST_PATH.exists():
        return {"total_samples": 0, "samples": []}
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/sample/{document_id}")
async def get_sample(document_id: str):
    """Load OCR text and existing annotations for a raw sample."""
    doc_id = sanitize_document_id(document_id)
    sample_file = RAW_DIR / f"{doc_id}.json"

    if not sample_file.exists():
        raise HTTPException(status_code=444, detail=f"Sample {doc_id} not found.")

    with open(sample_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Combine OCR page texts
    pages = raw_data.get("ocr_pages", [])
    ocr_text = "\n".join(p.get("text", "") for p in pages if p.get("text"))

    # Load pre-existing annotations if document was previously annotated
    existing_entities = []
    if DATASET_PATH.exists():
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    entry = json.loads(line_str)
                    if entry.get("text") == ocr_text:
                        existing_entities = entry.get("entities", [])
                        break
                except json.JSONDecodeError:
                    continue

    return {
        "document_id": doc_id,
        "filename": raw_data.get("filename", ""),
        "text": ocr_text,
        "entities": existing_entities,
        "allowed_labels": sorted(list(ALLOWED_LABELS))
    }

from app.services.land_record_extractor import extract_land_record

FIELD_TO_LABEL_MAP = {
    "district": "DISTRICT",
    "taluka": "TALUKA",
    "village": "VILLAGE",
    "survey_number": "SURVEY_NUMBER",
    "land_holding_type": "LAND_HOLDING_TYPE",
    "owner_name": "OWNER_NAME",
    "area": "AREA"
}

LABEL_PREFIX_KEYWORDS = {
    "TALUKA": ["तालुका", "तालुका:-"],
    "DISTRICT": ["जिल्हा", "जिल्हा:-", "जिल्हा:"],
    "VILLAGE": ["गाव", "गाव:-"],
    "SURVEY_NUMBER": ["भूमापन क्रमांक", "भूमापन"],
    "LAND_HOLDING_TYPE": ["भू-धारणापध्दती", "भू-धारणा"],
    "AREA": ["क्षेत्र"]
}


def find_safe_entity_span(ocr_text: str, target_val: str, label: str) -> Optional[Tuple[int, int]]:
    """
    Finds exact Python character indices (start, end) for target_val in ocr_text.
    Uses exact matching, keyword proximity for multi-occurrence, and whitespace normalization.
    Returns (start, end) if a safe, verified span is found; otherwise None.
    """
    if not target_val or not isinstance(target_val, str):
        return None

    target_val = target_val.strip()
    if not target_val:
        return None

    text_len = len(ocr_text)

    # 1. Exact string search
    occurrences = []
    idx = ocr_text.find(target_val, 0)
    while idx != -1:
        occurrences.append(idx)
        idx = ocr_text.find(target_val, idx + 1)

    if len(occurrences) == 1:
        start = occurrences[0]
        end = start + len(target_val)
        if 0 <= start < end <= text_len and ocr_text[start:end] == target_val:
            return (start, end)

    elif len(occurrences) > 1:
        # Check if label has a prefix keyword to disambiguate
        prefixes = LABEL_PREFIX_KEYWORDS.get(label, [])
        best_start = None
        for prefix in prefixes:
            p_idx = ocr_text.find(prefix)
            if p_idx != -1:
                after_p = [o for o in occurrences if o >= p_idx]
                if after_p:
                    best_start = min(after_p, key=lambda x: x - p_idx)
                    break
        if best_start is not None:
            end = best_start + len(target_val)
            if 0 <= best_start < end <= text_len and ocr_text[best_start:end] == target_val:
                return (best_start, end)
        return None

    # 2. Whitespace normalized match fallback
    norm_val = " ".join(target_val.split())
    regex_pattern = r"\s+".join(re.escape(w) for w in norm_val.split())
    matches = list(re.finditer(regex_pattern, ocr_text))

    if len(matches) == 1:
        m = matches[0]
        start = m.start()
        end = m.end()
        extracted_span = ocr_text[start:end]
        if 0 <= start < end <= text_len and " ".join(extracted_span.split()) == norm_val:
            return (start, end)

    return None


@app.get("/api/sample/{document_id}/suggestions")
async def get_suggestions(document_id: str):
    """
    Generate pre-annotation suggestions using the existing rule-based extractor.
    Validates exact character offsets (ocr_text[start:end] == value) before returning.
    """
    doc_id = sanitize_document_id(document_id)
    sample_file = RAW_DIR / f"{doc_id}.json"

    if not sample_file.exists():
        raise HTTPException(status_code=444, detail=f"Sample {doc_id} not found.")

    with open(sample_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    pages = raw_data.get("ocr_pages", [])
    ocr_text = "\n".join(p.get("text", "") for p in pages if p.get("text"))

    if not ocr_text.strip():
        return {"document_id": doc_id, "suggestions": []}

    # Run existing rule-based extractor
    extracted_record = extract_land_record(
        header_text=ocr_text,
        owner_text=ocr_text,
        crop_text=ocr_text
    )

    suggestions = []

    for field_name, label in FIELD_TO_LABEL_MAP.items():
        field_obj = getattr(extracted_record, field_name, None)
        if field_obj and field_obj.value:
            val = str(field_obj.value).strip()
            confidence = getattr(field_obj, "confidence", 0.0)

            span = find_safe_entity_span(ocr_text, val, label)
            if span:
                start, end = span
                matched_val = ocr_text[start:end]

                # Server-side verification check
                if 0 <= start < end <= len(ocr_text):
                    suggestions.append({
                        "label": label,
                        "value": matched_val,
                        "start": start,
                        "end": end,
                        "confidence": round(float(confidence), 2),
                        "source": "rule_based_extractor"
                    })

    return {
        "document_id": doc_id,
        "suggestions": suggestions
    }


@app.post("/api/annotate")
async def save_annotation(payload: Dict[str, Any] = Body(...)):
    """
    Validate and save entity annotations to land_records.jsonl,
    re-validate dataset, and update manifest status.
    """
    doc_id = sanitize_document_id(payload.get("document_id", ""))
    entities = payload.get("entities", [])

    sample_file = RAW_DIR / f"{doc_id}.json"
    if not sample_file.exists():
        raise HTTPException(status_code=444, detail=f"Sample {doc_id} not found.")

    with open(sample_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    pages = raw_data.get("ocr_pages", [])
    ocr_text = "\n".join(p.get("text", "") for p in pages if p.get("text"))

    if not ocr_text.strip():
        raise HTTPException(status_code=400, detail="OCR text is empty.")

    # 1. Enforce strict character offset boundaries and substring matching
    text_len = len(ocr_text)
    for idx, entity in enumerate(entities):
        start = entity.get("start")
        end = entity.get("end")
        label = entity.get("label")

        if not isinstance(start, int) or isinstance(start, bool) or \
           not isinstance(end, int) or isinstance(end, bool):
            raise HTTPException(
                status_code=400,
                detail=f"Entity {idx} '{label}': start and end must be integers."
            )

        if start < 0 or start >= end:
            raise HTTPException(
                status_code=400,
                detail=f"Entity {idx} '{label}': invalid range [{start}:{end}]. Start must be >= 0 and < end."
            )

        if end > text_len:
            raise HTTPException(
                status_code=400,
                detail=f"Entity {idx} '{label}': end index ({end}) exceeds text length ({text_len})."
            )

        if label not in ALLOWED_LABELS:
            raise HTTPException(
                status_code=400,
                detail=f"Entity {idx} '{label}': invalid label."
            )

        if "value" in entity and entity["value"]:
            extracted_span = ocr_text[start:end]
            if extracted_span != entity["value"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Entity {idx} '{label}': text mismatch at [{start}:{end}]. Expected '{entity['value']}', got '{extracted_span}'."
                )

    sample_entry = {
        "text": ocr_text,
        "entities": [
            {
                "start": e["start"],
                "end": e["end"],
                "label": e["label"]
            }
            for e in entities
        ]
    }

    is_valid, errors, _ = validate_example(sample_entry, line_number=1)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Annotation validation error: {'; '.join(errors)}")

    # 2. Update or append entry in land_records.jsonl
    existing_records = []
    updated = False

    if DATASET_PATH.exists():
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    record = json.loads(line_str)
                    if record.get("text") == ocr_text:
                        existing_records.append(sample_entry)
                        updated = True
                    else:
                        existing_records.append(record)
                except json.JSONDecodeError:
                    continue

    if not updated:
        existing_records.append(sample_entry)

    # Backup & overwrite JSONL dataset file
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        for rec in existing_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # 3. Validate entire dataset
    if not validate_dataset(DATASET_PATH):
        raise HTTPException(status_code=400, detail="Updated dataset failed global validation audit.")

    # 4. Update manifest status
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

        for s in manifest.get("samples", []):
            if s.get("document_id") == doc_id:
                s["status"] = "annotated"
                s["annotated"] = True
                break

        with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

    return {
        "status": "success",
        "document_id": doc_id,
        "total_entities": len(entities),
        "message": f"Successfully saved {len(entities)} annotations for {doc_id}."
    }


def main():
    print("\n=======================================================")
    print("      DOC2DIGITAL LOCAL NER ANNOTATION SERVER          ")
    print("=======================================================")
    print("Running at: http://127.0.0.1:8000")
    print("Press Ctrl+C to stop.\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
