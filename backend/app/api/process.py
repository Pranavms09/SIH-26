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

    first_image_path = image_paths[0]
    pdf_target = str(file_path) if extension == ".pdf" else None
    gemini_target = pdf_target or first_image_path

    requested_provider = (provider or get_primary_ai_provider()).lower()
    ai_success = False

    record = None
    validation = None
    extraction_metadata = {}
    complexity = {
        "classification": "simple",
        "score": 0.2,
        "threshold": 0.5,
        "reasons": []
    }
    pages = []

    # --------------------------------
    # 5. Direct AI Vision Fast-Path Execution (Gemini / Groq)
    # --------------------------------

    if requested_provider in ("gemini", "groq") or is_gemini_configured() or is_groq_configured():
        # Option A: Try Gemini 2.5 Flash (Primary Provider)
        if requested_provider == "gemini" or (requested_provider != "groq" and is_gemini_configured()):
            try:
                reset_gemini_service()
                print(f"[Doc2Digital Fast-Path] Calling Gemini 2.5 Flash Vision for {file.filename}")
                gemini_record = extract_land_record_with_gemini(gemini_target)
                ai_val_payload = validate_ai_record(gemini_record, source="gemini_vision")

                record = gemini_record
                validation = ai_val_payload.get("validation", {})
                extraction_metadata = {
                    "source": "gemini_vision",
                    "route": "gemini",
                    "extraction_coverage": 1.0
                }
                complexity = {
                    "classification": "complex",
                    "score": 0.85,
                    "threshold": 0.5,
                    "reasons": ["Direct Gemini Vision extraction"]
                }
                pages = [
                    {
                        "page_number": 1,
                        "text": f"7/12 Land Record digitized via Gemini 2.5 Flash Vision ({file.filename})"
                    }
                ]
                ai_success = True
            except Exception as gemini_err:
                safe_reason = _classify_gemini_error(str(gemini_err))
                print(f"Warning: Gemini 2.5 Flash extraction failed; trying fallback. Reason: {safe_reason}")
                extraction_metadata["gemini_error"] = safe_reason

        # Option B: Try Groq Vision (Secondary Provider)
        if not ai_success and (requested_provider == "groq" or is_groq_configured()):
            try:
                reset_groq_service()
                print(f"[Doc2Digital Fast-Path] Calling Groq Vision for {file.filename}")
                cropped_record_path = document_output_dir / "record_region.png"
                image_target = str(cropped_record_path) if cropped_record_path.exists() else first_image_path
                groq_record = extract_land_record_from_image(image_target)
                ai_val_payload = validate_ai_record(groq_record, source="groq_vision")

                record = groq_record
                validation = ai_val_payload.get("validation", {})
                extraction_metadata = {
                    "source": "groq_vision",
                    "route": "groq",
                    "extraction_coverage": 0.9
                }
                complexity = {
                    "classification": "complex",
                    "score": 0.8,
                    "threshold": 0.5,
                    "reasons": ["Direct Groq Vision extraction"]
                }
                pages = [
                    {
                        "page_number": 1,
                        "text": f"7/12 Land Record digitized via Groq Vision ({file.filename})"
                    }
                ]
                ai_success = True
            except Exception as groq_err:
                safe_reason = _classify_groq_error(str(groq_err))
                print(f"Warning: Groq Vision extraction failed; trying fallback. Reason: {safe_reason}")
                extraction_metadata["groq_error"] = safe_reason

    # --------------------------------
    # 6. Local OCR & Section Cropping Fallback (if AI disabled or failed)
    # --------------------------------

    if not ai_success:
        print(f"[Doc2Digital Fallback] Executing local Tesseract OCR pipeline for {file.filename}")
        for page_number, image_path in enumerate(image_paths, start=1):
            try:
                processed_image = Path(image_path).with_name(Path(image_path).stem + "_processed.png")
                preprocess_image(image_path, str(processed_image))
                text = extract_text(str(processed_image), language="mar+eng")
            except Exception as ocr_p_err:
                text = f"[OCR Error: {ocr_p_err}]"
            pages.append({"page_number": page_number, "text": text})

        try:
            cropped_record_path = document_output_dir / "record_region.png"
            crop_record_region(first_image_path, str(cropped_record_path))
            sections_dir = document_output_dir / "sections"
            sections = crop_record_sections(str(cropped_record_path), str(sections_dir))

            header_processed = sections_dir / "header_processed.png"
            preprocess_image(sections["header"], str(header_processed))
            header_text = extract_text(str(header_processed), language="mar+eng")

            owner_processed = sections_dir / "owner_processed.png"
            preprocess_image(sections["owner_rights"], str(owner_processed))
            owner_text = extract_text(str(owner_processed), language="mar+eng")

            crop_processed = sections_dir / "crop_processed.png"
            preprocess_image(sections["crop_table"], str(crop_processed))
            crop_text = extract_text(str(crop_processed), language="mar+eng")

            record = extract_land_record(header_text, owner_text, crop_text)
            validation = validate_land_record(record)
        except Exception as e:
            record = LandRecord()
            validation = {
                "status": "needs_review",
                "message": f"Section extraction failed: {str(e)}",
                "fields": {}
            }

        full_ocr_text = "\n".join(p.get("text", "") for p in pages)
        routing_result = route_document(
            ocr_text=full_ocr_text,
            record=record,
            validation=validation,
            page_count=len(pages),
        )
        selected_route = routing_result.get("route", "ocr")
        complexity = routing_result.get("complexity", {})
        coverage = complexity.get("extraction_coverage", 0.0)

        fallback_reason = (
            extraction_metadata.get("gemini_error")
            or extraction_metadata.get("groq_error")
            or "Local OCR requested"
        )
        extraction_metadata = {
            "source": "local_ocr",
            "route": selected_route,
            "extraction_coverage": coverage,
            "fallback_reason": fallback_reason,
        }

    # --------------------------------
    # 7. Collect raw sample for NER (side-effect)
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