"""
Complex 7/12 Document Vision/Document Extractor using Gemini 2.5 Flash API.

Extracts structured land record data from PDFs or page images of Maharashtra 7/12 (सातबारा उतारा) documents.
Preserves original Devanagari Marathi script, separates village names from pincodes,
and returns a strongly-typed LandRecord Pydantic model.
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, Optional

from app.models.land_record import ExtractedField, LandRecord
from app.services.gemini_service import (
    SUPPORTED_DOCUMENT_EXTENSIONS,
    get_gemini_service,
)

# Maximum document size allowed for Gemini API requests (20 MB)
MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024

SYSTEM_PROMPT = """You are an expert document AI specializing in Indian land records (7/12 records / सातबारा उतारा, RoR, rights of record) in Marathi, Hindi, and Devanagari scripts.
Your task is to visually analyze the document page/image and extract 7 specific land record fields into a single structured JSON object.

CRITICAL VISUAL & EXTRACTION INSTRUCTIONS:
1. VISUAL LAYOUT RECOGNITION: Analyze the actual document image visually. The document may contain printed Marathi/Devanagari, handwritten Marathi, irregular table grids, circled numbers, stamps, seals, handwritten corrections, and dense columnar structures.
2. SEPARATE LABELS FROM VALUES: Do NOT extract field labels (such as "District / जिल्हा", "Taluka / तालुका", "Village / गाव", "Survey Number / गट/सर्व्हे क्रमांक", "Owner / खातेदार") as values. Find the actual value associated with or positioned near each label.
3. PRESERVE MARATHI DEVANAGARI SCRIPT: Do NOT translate Devanagari text into English. Output the original script exactly as written in the record.
4. DO NOT HALLUCINATE: If a field is missing or unreadable due to blur, fading, or damage, set "value": null and "confidence": 0.0. Accuracy is paramount.
5. DISTRICT / TALUKA / VILLAGE: Locate the administrative header section. Extract the actual name of the District, Taluka/Tehsil, and Village (excluding postal pincodes).
6. SURVEY NUMBER (गट/भूमापन क्रमांक): Extract the exact survey number / subdivision (e.g., "124/3"). Distinguish survey numbers from page numbers, mutation numbers, account/khata numbers, dates, or mobile numbers.
7. LAND HOLDING TYPE (धारण प्रकार/पद्धती): Extract the tenure or holding class (e.g. "भोगवटादार वर्ग-1", "भोगवटादार वर्ग-2").
8. OWNER NAME (खातेदाराचे नाव/भोगवटादार): Extract the current primary land owner's name. Distinguish land owners from witnesses, revenue officers, neighboring boundary owners, or deceased ancestors.
9. AREA (क्षेत्रफळ): Extract the land area value (e.g. "0.24.00" in Hectare.Are.Centiare or equivalent). Distinguish land area from survey numbers, financial amounts, or dates.
10. FIELD-LEVEL CONFIDENCE: Provide a realistic confidence score between 0.0 and 1.0 for each field based on visual clarity and readability (clear printed text = 0.9-1.0, legible handwriting = 0.7-0.85, ambiguous handwriting = 0.4-0.6, unreadable/missing = 0.0).
"""

USER_PROMPT_TEMPLATE = """Visually analyze this land record document and extract exactly these 7 fields as a single JSON object:

{
  "district": {"value": "<District Name in original script>", "confidence": 0.0},
  "taluka": {"value": "<Taluka/Tehsil Name in original script>", "confidence": 0.0},
  "village": {"value": "<Village Name in original script, WITHOUT pincode>", "confidence": 0.0},
  "survey_number": {"value": "<Survey/Subdivision Number>", "confidence": 0.0},
  "land_holding_type": {"value": "<Land Holding Type/Class>", "confidence": 0.0},
  "owner_name": {"value": "<Primary Owner Name in original script>", "confidence": 0.0},
  "area": {"value": "<Land Area>", "confidence": 0.0}
}

Rules:
- Output ONLY the JSON object. No explanations, no markdown code blocks outside JSON.
- If a field cannot be visually read or is absent, set "value" to null and "confidence" to 0.0.
- NEVER translate Devanagari text into English.
- NEVER confuse field labels (e.g. "जिल्हा") with actual field values.
- NEVER confuse barcode, mutation, or page numbers with survey numbers.
"""


# Field alias mapping for robust schema matching across different Gemini JSON responses
FIELD_ALIASES = {
    "district": ["district", "district_name", "jilha", "जिल्हा"],
    "taluka": ["taluka", "tehsil", "taluka_name", "tehsil_name", "तालुका"],
    "village": ["village", "village_name", "gav", "gaon", "गाव"],
    "survey_number": ["survey_number", "survey_no", "gat_number", "gat_no", "khasra_no", "khasra_number", "bhumapan_no", "भूमापन_क्रमांक", "गट_क्रमांक"],
    "land_holding_type": ["land_holding_type", "holding_type", "tenure", "holding_class", "धारण_प्रकार", "भू_धारणा_पद्धती"],
    "owner_name": ["owner_name", "owner", "owners", "owner_names", "primary_owner", "khatedar", "खातेदाराचे_नाव", "भोगवटादाराचे_नाव"],
    "area": ["area", "land_area", "plot_area", "total_area", "क्षेत्रफळ"],
}


def validate_document_file(document_path: str) -> Path:
    """
    Validate existence, extension, and file size of input document.

    Args:
        document_path (str): Path to local PDF or image file.

    Returns:
        Path: Path object of valid document file.

    Raises:
        FileNotFoundError: If document file does not exist.
        ValueError: If extension is unsupported or file size exceeds limits.
    """
    path = Path(document_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Document file not found: {document_path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_DOCUMENT_EXTENSIONS:
        supported = ", ".join(SUPPORTED_DOCUMENT_EXTENSIONS.keys())
        raise ValueError(f"Unsupported document format '{ext}'. Supported: {supported}")

    size = path.stat().st_size
    if size == 0:
        raise ValueError(f"Document file is empty: {document_path}")
    if size > MAX_DOCUMENT_SIZE_BYTES:
        raise ValueError(
            f"Document exceeds request size limit (max 20MB): {size} bytes"
        )

    return path


def clamp_confidence(confidence: Any) -> float:
    """Safely convert and clamp confidence to float in range [0.0, 1.0]."""
    try:
        val = float(confidence)
        return max(0.0, min(1.0, val))
    except (ValueError, TypeError):
        return 0.5


def normalize_field_dict(field_data: Any) -> ExtractedField:
    """
    Normalize raw parsed JSON field data into an ExtractedField instance.

    Handles:
    - Dict with "value" and "confidence"
    - Simple scalar values (string, float, int)
    - Lists of strings or dicts (e.g. multiple owner names)
    - Medium/low confidence retention (retains value even if confidence is 0.4 - 0.7)

    Args:
        field_data (Any): Raw value, list, or dict from parsed JSON.

    Returns:
        ExtractedField: Normalized ExtractedField object.
    """
    if field_data is None:
        return ExtractedField(value=None, confidence=0.0)

    # Handle lists of items (e.g., list of owner names or dictionary objects)
    if isinstance(field_data, list):
        if not field_data:
            return ExtractedField(value=None, confidence=0.0)
        
        extracted_vals = []
        conf_sum = 0.0
        for item in field_data:
            norm_item = normalize_field_dict(item)
            if norm_item.value:
                extracted_vals.append(norm_item.value)
                conf_sum += norm_item.confidence
        
        if extracted_vals:
            joined_val = ", ".join(extracted_vals)
            avg_conf = round(conf_sum / len(extracted_vals), 2)
            return ExtractedField(value=joined_val, confidence=avg_conf)
        return ExtractedField(value=None, confidence=0.0)

    if isinstance(field_data, dict):
        raw_val = field_data.get("value") or field_data.get("name") or field_data.get("text")
        raw_conf = field_data.get("confidence", 0.75 if raw_val else 0.0)
    else:
        raw_val = field_data
        raw_conf = 0.75 if raw_val else 0.0

    if raw_val is None:
        return ExtractedField(value=None, confidence=0.0)

    val_str = str(raw_val).strip()
    if not val_str or val_str.lower() in ("null", "none", "n/a", "unknown", "—", "-"):
        return ExtractedField(value=None, confidence=0.0)

    conf = clamp_confidence(raw_conf)
    return ExtractedField(value=val_str, confidence=conf)


def parse_gemini_json_response(response_text: str) -> Dict[str, Any]:
    """
    Clean and parse JSON output from Gemini 2.5 Flash model response.

    Handles:
    - Pure JSON responses
    - Markdown-fenced JSON (```json ... ``` or ```text ... ```)
    - Code fences without language tag
    - Embedded JSON objects
    - Unwrapping top-level wrapper keys (record, data, land_record, fields)

    Args:
        response_text (str): Raw string response from Gemini.

    Returns:
        Dict[str, Any]: Parsed JSON dictionary.

    Raises:
        ValueError: If JSON is invalid or missing required structure.
    """
    cleaned = response_text.strip()

    # Strip markdown code fencing if present
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json|text)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    data = None
    # Try direct parse
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: extract first {...} JSON object
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                data = json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

    if isinstance(data, dict):
        # Unwrap nested top-level wrapper keys if present
        for wrapper_key in ("land_record", "record", "extracted_data", "data", "fields"):
            if wrapper_key in data and isinstance(data[wrapper_key], dict):
                return data[wrapper_key]
        return data

    raise ValueError(
        f"Failed to parse Gemini response as JSON dictionary. "
        f"Response preview: {response_text[:200]!r}"
    )


def extract_land_record_with_gemini(
    document_path: str,
    custom_prompt: Optional[str] = None,
    temperature: float = 0.1,
) -> LandRecord:
    """
    Extract structured 7/12 land record information from a PDF or page image using Gemini 2.5 Flash API.

    Args:
        document_path (str): Local path to PDF or image file.
        custom_prompt (Optional[str]): Optional custom prompt override.
        temperature (float): Model sampling temperature (default 0.1 for consistent extraction).

    Returns:
        LandRecord: Validated Pydantic model with extracted Marathi fields and confidence scores.
    """
    # 1. Validate document
    validate_document_file(document_path)

    # 2. Get Gemini service and check configuration
    gemini_service = get_gemini_service()
    if not gemini_service.is_configured():
        raise RuntimeError(
            "Gemini API service is not configured. Please set GEMINI_API_KEY environment variable."
        )

    prompt = custom_prompt if custom_prompt else USER_PROMPT_TEMPLATE

    print(f"[Gemini Vision Service] Calling gemini-2.5-flash for document: {document_path}")

    # 3. Call Gemini 2.5 Flash API via gemini_service
    raw_response = gemini_service.generate_gemini_completion(
        file_path=document_path,
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        json_mode=True,
        temperature=temperature,
        max_tokens=2048,
    )

    print(f"[Gemini Vision Service] Raw Response Preview: {raw_response[:200]!r}")

    # 4. Parse JSON
    parsed_json = parse_gemini_json_response(raw_response)

    # Normalize keys in parsed_json (lowercase, stripped of underscores/spaces)
    normalized_keys = {
        re.sub(r"[\s_]+", "", str(k).lower()): v
        for k, v in parsed_json.items()
    }

    # 5. Map fields using FIELD_ALIASES for robust schema extraction
    expected_fields = [
        "district",
        "taluka",
        "village",
        "survey_number",
        "land_holding_type",
        "owner_name",
        "area",
    ]

    record_kwargs = {}
    matched_count = 0

    for target_field in expected_fields:
        field_raw = None
        aliases = FIELD_ALIASES.get(target_field, [target_field])
        
        for alias in aliases:
            clean_alias = re.sub(r"[\s_]+", "", alias.lower())
            if clean_alias in normalized_keys:
                field_raw = normalized_keys[clean_alias]
                break

        norm_field = normalize_field_dict(field_raw)
        record_kwargs[target_field] = norm_field
        if norm_field.value is not None:
            matched_count += 1

    print(f"[Gemini Vision Service] Extracted Non-Null Fields: {matched_count}/{len(expected_fields)}")

    return LandRecord(**record_kwargs)
