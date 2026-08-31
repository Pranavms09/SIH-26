"""
AI Validation Service Adapter for BhuLekha.

Connects AI Vision/Document extracted LandRecord objects (from Gemini 2.5 Flash or Groq Vision)
to the existing authoritative validation pipeline (validation_service, reference_service, consistency_service).

GUARANTEES:
1. Does NOT duplicate existing validation logic.
2. Does NOT mutate AI-extracted values in LandRecord.
3. Preserves AI field confidence scores alongside validation results.
4. Ensures validation status remains the conservative final authority.
"""

from typing import Dict, Any, Optional
import copy

from app.models.land_record import LandRecord
from app.services.validation_service import validate_land_record
from app.services.vision_extractor import extract_land_record_from_image
from app.services.gemini_vision_extractor import extract_land_record_with_gemini


def validate_ai_record(
    record: LandRecord,
    source: str = "groq_vision",
) -> Dict[str, Any]:
    """
    Pass an AI-extracted LandRecord through the existing authoritative validation engine.

    Args:
        record (LandRecord): Pydantic LandRecord model output from vision/document extraction.
        source (str): Provenance tracking tag (e.g. "gemini_vision" or "groq_vision").

    Returns:
        Dict[str, Any]: Combined payload containing source provenance, original unmutated record,
                       and authoritative validation result dictionary.
    """
    # Create an explicit snapshot of record values to guarantee zero mutation
    original_values = record.model_dump()

    # Pass record directly to existing validation_service.py
    validation_result = validate_land_record(record)

    # Post-condition assertion: verify record values were not mutated by validation
    current_values = record.model_dump()
    if original_values != current_values:
        raise RuntimeError("CRITICAL ERROR: Validation service mutated the AI LandRecord!")

    return {
        "source": source,
        "record": record,
        "validation": validation_result,
    }


def process_and_validate_vision_image(
    image_path: str,
    custom_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Pipeline helper: extracts LandRecord from an image using Groq Vision,
    then runs it through the authoritative validation engine.

    Args:
        image_path (str): Local path to 7/12 land record page image.
        custom_prompt (Optional[str]): Optional vision prompt override.

    Returns:
        Dict[str, Any]: Combined response with source, extracted record, and validation payload.
    """
    record = extract_land_record_from_image(
        image_path=image_path,
        custom_prompt=custom_prompt,
    )
    return validate_ai_record(record=record, source="groq_vision")


def process_and_validate_gemini_document(
    document_path: str,
    custom_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Pipeline helper: extracts LandRecord from a PDF or image using Gemini 2.5 Flash,
    then runs it through the authoritative validation engine.

    Args:
        document_path (str): Local path to 7/12 land record PDF or image file.
        custom_prompt (Optional[str]): Optional document prompt override.

    Returns:
        Dict[str, Any]: Combined response with source, extracted record, and validation payload.
    """
    record = extract_land_record_with_gemini(
        document_path=document_path,
        custom_prompt=custom_prompt,
    )
    return validate_ai_record(record=record, source="gemini_vision")
