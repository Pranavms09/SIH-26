from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pathlib import Path
import shutil
import uuid
from typing import Optional

from app.config import get_primary_ai_provider, is_gemini_configured, is_groq_configured
from app.models.land_record import LandRecord
from app.services.document_processor import (
    pdf_to_images,
    preprocess_image,
    crop_record_region,
    crop_record_sections
)
from app.services.ocr_service import extract_text
from app.services.land_record_extractor import extract_land_record
from app.services.validation_service import validate_land_record
from app.services.extraction_router import route_document
from app.services.vision_extractor import extract_land_record_from_image
from app.services.gemini_vision_extractor import extract_land_record_with_gemini
from app.services.ai_validation_service import validate_ai_record
from app.services.groq_service import reset_groq_service, _classify_groq_error
from app.services.gemini_service import reset_gemini_service, _classify_gemini_error


router = APIRouter(
    prefix="/api",
    tags=["Document Processing"]
)


UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = UPLOAD_DIR / "processed"

UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)


@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    provider: Optional[str] = Query(None, description="Preferred AI provider ('gemini' or 'groq')")
):

    # --------------------------------
    # 1. Validate file
    # --------------------------------

    extension = Path(file.filename).suffix.lower()

    allowed_extensions = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )


    # --------------------------------
    # 2. Generate unique filename
    # --------------------------------

    document_id = str(uuid.uuid4())

    filename = f"{document_id}{extension}"

    file_path = UPLOAD_DIR / filename


    # --------------------------------
    # 3. Save uploaded file
    # --------------------------------

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    # --------------------------------
    # 4. Handle PDF / Image conversion
    # --------------------------------

    document_output_dir = PROCESSED_DIR / document_id
    document_output_dir.mkdir(parents=True, exist_ok=True)

    if extension == ".pdf":

        image_paths = pdf_to_images(
            str(file_path),
            str(document_output_dir)
        )

    else:

        image_paths = [
            str(file_path)
        ]


    # --------------------------------
    # 5. Process each page for full text
    # --------------------------------

    pages = []

    for page_number, image_path in enumerate(
        image_paths,
        start=1
    ):

        processed_image = (
            Path(image_path).with_name(
                Path(image_path).stem
                + "_processed.png"
            )
        )

        preprocess_image(
            image_path,
            str(processed_image)
        )


        # --------------------------------
        # 6. OCR full page text
        # --------------------------------

        text = extract_text(
            str(processed_image),
            language="mar+eng"
        )


        pages.append({
            "page_number": page_number,
            "text": text
        })


    # --------------------------------
    # 7. Section cropping, initial rule extraction & validation
    # --------------------------------

    try:
        first_image_path = image_paths[0]

        cropped_record_path = document_output_dir / "record_region.png"
        crop_record_region(
            first_image_path,
            str(cropped_record_path)
        )

        sections_dir = document_output_dir / "sections"
        sections = crop_record_sections(
            str(cropped_record_path),
            str(sections_dir)
        )

        header_processed = sections_dir / "header_processed.png"
        preprocess_image(
            sections["header"],
            str(header_processed)
        )
        header_text = extract_text(
            str(header_processed),
            language="mar+eng"
        )

        owner_processed = sections_dir / "owner_processed.png"
        preprocess_image(
            sections["owner_rights"],
            str(owner_processed)
        )
        owner_text = extract_text(
            str(owner_processed),
            language="mar+eng"
        )

        crop_processed = sections_dir / "crop_processed.png"
        preprocess_image(
            sections["crop_table"],
            str(crop_processed)
        )
        crop_text = extract_text(
            str(crop_processed),
            language="mar+eng"
        )

        record = extract_land_record(
            header_text,
            owner_text,
            crop_text
        )

        validation = validate_land_record(record)

    except Exception as e:
        record = LandRecord()
        validation = {
            "status": "needs_review",
            "message": f"Section extraction failed: {str(e)}",
            "fields": {}
        }


    # --------------------------------
    # 7.1. Complexity Analysis & Extraction Routing
    # --------------------------------

    full_ocr_text = "\n".join(p.get("text", "") for p in pages)
    routing_result = route_document(
        ocr_text=full_ocr_text,
        record=record,
        validation=validation,
        page_count=len(pages),
    )

    selected_route = routing_result.get("route", "ocr")
    complexity = routing_result.get("complexity", {})

    extraction_metadata = {
        "source": "rule_based_ocr",
        "route": selected_route,
    }


    # --------------------------------
    # 7.2. Hybrid Route Execution (Multi-Provider AI Architecture)
    # --------------------------------

    if selected_route in ("groq", "gemini", "ai"):
        requested_provider = (provider or get_primary_ai_provider()).lower()
        ai_success = False

        image_target = str(cropped_record_path) if cropped_record_path.exists() else first_image_path
        pdf_target = str(file_path) if extension == ".pdf" else None
        gemini_target = pdf_target or image_target

        # Option A: Try Gemini 2.5 Flash as Primary Provider (supports PDF directly)
        if requested_provider == "gemini" or (requested_provider != "groq" and is_gemini_configured()):
            try:
                reset_gemini_service()
                gemini_record = extract_land_record_with_gemini(gemini_target)
                ai_val_payload = validate_ai_record(gemini_record, source="gemini_vision")

                record = gemini_record
                validation = ai_val_payload.get("validation", {})
                extraction_metadata["source"] = "gemini_vision"
                extraction_metadata["route"] = "gemini"
                ai_success = True
            except Exception as gemini_err:
                safe_reason = _classify_gemini_error(str(gemini_err))
                print(f"Warning: Gemini 2.5 Flash extraction failed; trying secondary AI/Fallback. Reason: {safe_reason}")
                extraction_metadata["gemini_error"] = safe_reason

        # Option B: Try Groq Vision as Secondary Provider if Gemini failed or Groq was requested
        if not ai_success and (requested_provider == "groq" or is_groq_configured()):
            try:
                reset_groq_service()
                groq_record = extract_land_record_from_image(image_target)
                ai_val_payload = validate_ai_record(groq_record, source="groq_vision")

                record = groq_record
                validation = ai_val_payload.get("validation", {})
                extraction_metadata["source"] = "groq_vision"
                extraction_metadata["route"] = "groq"
                ai_success = True
            except Exception as groq_err:
                safe_reason = _classify_groq_error(str(groq_err))
                print(f"Warning: Groq Vision extraction failed; falling back to rule-based OCR. Reason: {safe_reason}")
                extraction_metadata["groq_error"] = safe_reason

        # Option C: Rule-based OCR Fallback if all AI providers failed or were unconfigured
        if not ai_success:
            fallback_reason = (
                extraction_metadata.get("gemini_error")
                or extraction_metadata.get("groq_error")
                or "No AI provider configured"
            )
            extraction_metadata["source"] = "rule_based_ocr_fallback"
            extraction_metadata["fallback_reason"] = fallback_reason


    # --------------------------------
    # 7.5. Collect raw sample for NER (side-effect)
    # --------------------------------

    try:
        from tools.save_ner_raw_sample import save_raw_sample
        save_raw_sample(
            document_id=document_id,
            filename=file.filename,
            pages=pages,
            record=record,
            validation=validation
        )
    except Exception as raw_err:
        print(f"Warning: Failed to save raw NER sample for {document_id}: {raw_err}")


    # --------------------------------
    # 8. Return result with backward-compatible schema
    # --------------------------------

    return {
        "message": "Document processed successfully",
        "document_id": document_id,
        "filename": file.filename,
        "pages": pages,
        "record": record,
        "validation": validation,
        "extraction": extraction_metadata,
        "complexity": complexity,
    }