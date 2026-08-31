"""
Complex 7/12 Document Vision Extraction Service using Groq Vision LLM API.

Extracts structured land record data from page images of Maharashtra 7/12 documents.
Preserves original Marathi script, separates village names from pincodes, and returns a strongly-typed LandRecord model.

REQUIRED GROQ MODEL: Must be a Groq vision-capable model (accepts image_url content).
  Recommended: meta-llama/llama-4-scout-17b-16e-instruct
  DO NOT use qwen/qwen3.6-27b — it is text-only and will return HTTP 400 json_validate_failed.
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, Optional

from app.models.land_record import LandRecord, ExtractedField
from app.services.groq_service import (
    get_groq_service,
    SUPPORTED_IMAGE_EXTENSIONS,
)

# Maximum image size allowed for Groq Vision requests (20 MB)
MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024

SYSTEM_PROMPT = """You are an expert document AI specializing in Maharashtra 7/12 (सातबारा उतारा) land records written in Marathi.
Your task is to analyze the document page image and extract 7 specific land record fields into structured JSON format.

CRITICAL INSTRUCTIONS:
1. OUTPUT JSON ONLY — return a single valid JSON object, no markdown fences, no explanatory text, no preamble.
2. PRESERVE MARATHI TEXT: Do NOT translate Marathi text to English. Output original Devanagari Marathi script exactly as visible (e.g. "बीड", "अंबाजोगाई", "विलासराव पाटील", "भोगवटादार वर्ग-1").
3. DO NOT HALLUCINATE: If a field is unreadable or absent, set "value": null and "confidence": 0.0.
4. VILLAGE vs PINCODE: Extract ONLY the village name (e.g., "अंबाजोगाई (रुरल)"). Separate and EXCLUDE pincodes or postal codes like "(560022)".
5. SURVEY NUMBER: Extract the exact survey number / subdivision (भूमापन क्रमांक व उपविभाग) e.g. "312/2". Do not confuse with 10+ digit account numbers, barcode numbers, document IDs, or mobile numbers.
6. LAND HOLDING TYPE: Look for "भू-धारणा पद्धती" field (e.g. "भोगवटादार वर्ग-1").
7. OWNER NAME: Extract the primary land owner name(s) (खातेदाराचे नाव / भोगवटादाराचे नाव). If multiple owners exist in the document, provide the most prominent or first-listed primary owner only. Do NOT include witnesses, legal footnotes, mutation parties, officers, or deceased (मयत) ancestors unless they are the listed current owner.
8. AREA: Extract land area exactly as written in Hectare.Are.Centiare format (e.g. "0.24.00"). Do NOT convert units or do arithmetic. If multiple rows exist, use the total area or the first listed row's area — do NOT merge or calculate.
9. CONFIDENCE SCORES: Provide a visual extraction confidence score between 0.0 and 1.0 for each field.
10. COMPLEX DOCUMENTS: This document may have multiple rows, columns, tables, or co-owners. Extract the primary/most representative values. Do NOT leave fields empty when values are visible.
"""

USER_PROMPT_TEMPLATE = """Analyze this Maharashtra 7/12 land record page image and extract exactly these 7 fields as a single JSON object:

{
  "district": {"value": "<Marathi District Name after जिल्हा>", "confidence": 0.95},
  "taluka": {"value": "<Marathi Taluka Name after तालुका>", "confidence": 0.95},
  "village": {"value": "<Marathi Village Name after गाव, WITHOUT pincode>", "confidence": 0.95},
  "survey_number": {"value": "<Survey/Subdivision Number e.g. 312/2>", "confidence": 0.90},
  "land_holding_type": {"value": "<Land Holding Type from भू-धारणा पद्धती>", "confidence": 0.90},
  "owner_name": {"value": "<Primary Owner Name in Marathi>", "confidence": 0.90},
  "area": {"value": "<Area in H.A.CA format e.g. 0.24.00>", "confidence": 0.85}
}

Rules:
- Output ONLY the JSON object above. No other text.
- If a field cannot be read, set "value" to null and "confidence" to 0.0.
- NEVER translate Marathi to English.
- NEVER include pincodes in village names.
- NEVER confuse barcode/account/document IDs with survey numbers.
"""


def validate_image_file(image_path: str) -> Path:
    """
    Validate existence, extension, and file size of input image.

    Args:
        image_path (str): Path to local image file.

    Returns:
        Path: Path object of valid image.

    Raises:
        FileNotFoundError: If image file does not exist.
        ValueError: If extension is unsupported or file size exceeds limits.
    """
    path = Path(image_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_IMAGE_EXTENSIONS:
        supported = ", ".join(SUPPORTED_IMAGE_EXTENSIONS.keys())
        raise ValueError(f"Unsupported image format '{ext}'. Supported: {supported}")

    size = path.stat().st_size
    if size == 0:
        raise ValueError(f"Image file is empty: {image_path}")
    if size > MAX_IMAGE_SIZE_BYTES:
        raise ValueError(
            f"Image exceeds Groq vision request size limit (max 20MB): {size} bytes"
        )

    return path


def clamp_confidence(confidence: Any) -> float:
    """Safely convert and clamp confidence to float in range [0.0, 1.0]."""
    try:
        val = float(confidence)
        return max(0.0, min(1.0, val))
    except (ValueError, TypeError):
        return 0.0


def normalize_field_dict(field_data: Any) -> ExtractedField:
    """
    Normalize raw parsed JSON field data into an ExtractedField instance.

    Args:
        field_data (Any): Raw value or dict from parsed JSON.

    Returns:
        ExtractedField: Normalized ExtractedField object.
    """
    if isinstance(field_data, dict):
        raw_val = field_data.get("value")
        raw_conf = field_data.get("confidence", 0.0)
    else:
        raw_val = field_data
        raw_conf = 0.8 if raw_val else 0.0

    if raw_val is None:
        return ExtractedField(value=None, confidence=0.0)

    val_str = str(raw_val).strip()
    if not val_str or val_str.lower() in ("null", "none", "n/a", "unknown"):
        return ExtractedField(value=None, confidence=0.0)

    conf = clamp_confidence(raw_conf)
    return ExtractedField(value=val_str, confidence=conf)


def parse_vision_json_response(response_text: str) -> Dict[str, Any]:
    """
    Clean and parse JSON output from Groq Vision model response.

    Handles:
    - Pure JSON responses
    - Markdown-fenced JSON (```json ... ```)
    - JSON embedded in surrounding explanation text (extracts first {...} block)

    Args:
        response_text (str): Raw string response from Groq.

    Returns:
        Dict[str, Any]: Parsed JSON dictionary.

    Raises:
        ValueError: If JSON is invalid or missing required structure.
    """
    cleaned = response_text.strip()

    # Strip markdown code fencing if present
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    # Try direct parse first
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # Fallback: extract first {...} JSON object from surrounding text
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            pass

    raise ValueError(
        f"Failed to parse Groq vision response as JSON. "
        f"Response preview: {response_text[:200]!r}"
    )


def extract_land_record_from_image(
    image_path: str,
    custom_prompt: Optional[str] = None,
    temperature: float = 0.1,
) -> LandRecord:
    """
    Extract structured 7/12 land record information from a page image using Groq Vision API.

    Args:
        image_path (str): Local path to 7/12 document page image.
        custom_prompt (Optional[str]): Optional custom prompt override.
        temperature (float): Model sampling temperature (default 0.1 for consistent extraction).

    Returns:
        LandRecord: Validated Pydantic model with extracted Marathi fields and confidence scores.

    Raises:
        RuntimeError: If Groq service is unconfigured or API fails.
        FileNotFoundError: If image file does not exist.
        ValueError: If image size/format is invalid or JSON parsing fails.
    """
    # 1. Validate image
    validate_image_file(image_path)

    # 2. Get Groq service and check configuration
    groq_service = get_groq_service()
    if not groq_service.is_configured():
        raise RuntimeError(
            "Groq API service is not configured. Please set GROQ_API_KEY environment variable."
        )

    prompt = custom_prompt if custom_prompt else USER_PROMPT_TEMPLATE

    # 3. Call Groq Vision API via groq_service
    # json_mode=True: tries response_format=json_object first;
    # groq_service will auto-retry without it if the model returns json_validate_failed.
    raw_response = groq_service.generate_vision_completion(
        image_path=image_path,
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        json_mode=True,
        temperature=temperature,
        max_tokens=1024,
    )

    # 4. Parse JSON (handles markdown fences and embedded JSON)
    parsed_json = parse_vision_json_response(raw_response)

    # 5. Normalize into LandRecord model fields
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
    for field in expected_fields:
        field_raw = parsed_json.get(field)
        record_kwargs[field] = normalize_field_dict(field_raw)

    return LandRecord(**record_kwargs)
