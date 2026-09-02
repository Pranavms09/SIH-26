"""
Document Complexity Analyzer Service for Doc2Digital.

Analyzes 7/12 land records using a multi-signal deterministic scoring system
to classify document complexity without invoking machine learning models or external LLMs.
"""

from typing import Dict, Any, Optional, List
import re

from app.models.land_record import LandRecord

# Default complexity classification threshold
DEFAULT_COMPLEXITY_THRESHOLD = 0.50

# Configurable post-OCR escalation thresholds
MIN_LOCAL_EXTRACTION_COVERAGE = 0.50  # Require at least 50% (4/7) fields for Local OCR to be accepted
MIN_OCR_CONFIDENCE = 0.60             # Minimum OCR quality threshold
ENABLE_VISION_ESCALATION = True       # Enable escalation to Gemini Vision when Local OCR coverage is insufficient

# Key table & layout section indicators in Marathi 7/12 records
TABLE_KEYWORDS = [
    "पिकांचे नाव",
    "हंगाम",
    "जलसिंचन",
    "इतर अधिकार",
    "अतिक्रमण",
    "आकारणी",
    "पोटखराब",
    "खाताक्रमांक",
]

# Keywords indicating complex ownership/holding structures
COMPLEX_OWNER_KEYWORDS = [
    "सामायिक",
    "मयत",
    "वारस",
    "बोजा",
    "वर्ग-2",
    "कुळ",
    "विश्वस्त",
]


def analyze_document_complexity(
    ocr_text: Optional[str] = None,
    record: Optional[LandRecord] = None,
    validation: Optional[Dict[str, Any]] = None,
    page_count: int = 1,
    threshold: float = DEFAULT_COMPLEXITY_THRESHOLD,
) -> Dict[str, Any]:
    """
    Analyze multi-signal complexity of a land record document.

    Args:
        ocr_text (Optional[str]): Full or section OCR text string.
        record (Optional[LandRecord]): Extracted LandRecord object from rule-based extractor.
        validation (Optional[Dict[str, Any]]): Validation dictionary from validate_land_record().
        page_count (int): Total number of document pages (default 1).
        threshold (float): Classification threshold (default 0.50).

    Returns:
        Dict[str, Any]: Diagnostic payload containing classification, score, threshold,
                       recommended_route, signals breakdown, and explainable reasons.
    """
    reasons: List[str] = []
    signals: Dict[str, Dict[str, Any]] = {}
    total_score = 0.0

    # ------------------------------------------------------------------
    # Signal 1: Rule-Based Extractor Field Completeness & Coverage (Weight: 0.50)
    # ------------------------------------------------------------------
    sig1_weight = 0.50
    extraction_coverage = 0.0
    if record is not None:
        expected_fields = [
            record.district,
            record.taluka,
            record.village,
            record.survey_number,
            record.land_holding_type,
            record.owner_name,
            record.area,
        ]
        extracted_count = sum(
            1 for f in expected_fields
            if f and f.value and str(f.value).strip() and str(f.value).strip() not in ("—", "-", "null", "none")
        )
        missing_count = 7 - extracted_count
        extraction_coverage = round(extracted_count / 7.0, 3)

        sig1_score = round((missing_count / 7.0) * sig1_weight, 3)
        total_score += sig1_score

        if missing_count > 0:
            reasons.append(f"Rule-based extractor missed {missing_count} out of 7 expected fields (coverage: {extracted_count}/7).")
        else:
            reasons.append("All 7 expected fields were extracted cleanly by rule-based pipeline.")

        signals["field_completeness"] = {
            "score": sig1_score,
            "max_weight": sig1_weight,
            "details": f"{extracted_count}/7 fields extracted cleanly",
            "coverage": extraction_coverage,
        }
    else:
        signals["field_completeness"] = {
            "score": 0.0,
            "max_weight": sig1_weight,
            "details": "Record model not provided",
            "coverage": 0.0,
        }

    # ------------------------------------------------------------------
    # Signal 2: Validation Status & Failure Warning (Weight: 0.20)
    # ------------------------------------------------------------------
    sig2_weight = 0.20
    sig2_score = 0.0
    val_details = []

    if validation is not None:
        val_status = validation.get("status", "valid")
        fields = validation.get("fields", {})

        if val_status == "needs_review":
            sig2_score += 0.10
            val_details.append("overall validation status needs_review")

        survey_ref = fields.get("survey_reference", {})
        if survey_ref.get("status") in ("possible_error", "not_found", "invalid"):
            sig2_score += 0.05
            val_details.append(f"survey_reference status {survey_ref.get('status')}")

        consistency = fields.get("cross_field_consistency", {})
        if consistency.get("status") == "suspicious":
            sig2_score += 0.05
            val_details.append("cross_field_consistency status suspicious")

        sig2_score = min(sig2_weight, round(sig2_score, 3))
        total_score += sig2_score

        if sig2_score > 0:
            reasons.append(f"Validation engine flagged issues: {', '.join(val_details)}.")
        else:
            reasons.append("Validation engine reported valid status without warnings.")

        signals["validation_status"] = {
            "score": sig2_score,
            "max_weight": sig2_weight,
            "details": "; ".join(val_details) if val_details else "All checks valid",
        }
    else:
        signals["validation_status"] = {
            "score": 0.0,
            "max_weight": sig2_weight,
            "details": "Validation result not provided",
        }

    # ------------------------------------------------------------------
    # Signal 3: Table / Layout Structure Density (Weight: 0.15)
    # ------------------------------------------------------------------
    sig3_weight = 0.15
    sig3_score = 0.0
    text = ocr_text or ""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    line_count = len(lines)

    if line_count > 25:
        sig3_score += 0.08

    detected_keywords = [kw for kw in TABLE_KEYWORDS if kw in text]
    if len(detected_keywords) >= 2:
        sig3_score += 0.07

    sig3_score = min(sig3_weight, round(sig3_score, 3))
    total_score += sig3_score

    if sig3_score > 0:
        reasons.append(
            f"High layout density detected ({line_count} lines, table keywords: {', '.join(detected_keywords[:3])})."
        )
    else:
        reasons.append("Standard line and table layout density.")

    signals["table_density"] = {
        "score": sig3_score,
        "max_weight": sig3_weight,
        "details": f"{line_count} lines, {len(detected_keywords)} table keywords detected",
    }

    # ------------------------------------------------------------------
    # Signal 4: Owner Structure Complexity (Weight: 0.10)
    # ------------------------------------------------------------------
    sig4_weight = 0.10
    sig4_score = 0.0
    detected_owner_terms = [kw for kw in COMPLEX_OWNER_KEYWORDS if kw in text]

    owner_str = ""
    if record and record.owner_name and record.owner_name.value:
        owner_str = record.owner_name.value

    has_multiple_owners = (
        len(detected_owner_terms) > 0
        or "," in owner_str
        or "\n" in owner_str
        or bool(re.search(r"(?:\s|^)(?:आणि|व)(?:\s|$)", owner_str))
    )

    if has_multiple_owners:
        sig4_score = sig4_weight
        total_score += sig4_score
        reasons.append("Multiple owner candidates or complex joint holding terms detected.")
    else:
        reasons.append("Standard single owner structure.")

    signals["owner_complexity"] = {
        "score": sig4_score,
        "max_weight": sig4_weight,
        "details": f"Multiple owners/keywords: {has_multiple_owners}",
    }

    # ------------------------------------------------------------------
    # Signal 5: Low OCR Quality / Handwriting / Missing Landmarks (Weight: 0.15)
    # ------------------------------------------------------------------
    sig5_weight = 0.15
    sig5_score = 0.0
    char_count = len(text)

    key_landmarks = ["जिल्हा", "तालुका", "गाव", "गट", "भूमापन", "7/12", "सातबारा"]
    found_landmarks = [kw for kw in key_landmarks if kw in text]

    if char_count < 150 or len(found_landmarks) < 2 or (record and extraction_coverage < 0.50):
        sig5_score = sig5_weight
        total_score += sig5_score
        reasons.append("Low OCR quality / missing key header landmarks indicates handwritten or degraded document.")

    signals["ocr_text_quality"] = {
        "score": sig5_score,
        "max_weight": sig5_weight,
        "details": f"{char_count} chars, {len(found_landmarks)} landmarks found",
    }

    # ------------------------------------------------------------------
    # Final Score & Classification
    # ------------------------------------------------------------------
    final_score = round(min(1.0, total_score), 3)

    from app.config import get_primary_ai_provider
    primary_ai = get_primary_ai_provider().lower()

    if final_score >= threshold:
        classification = "complex"
        recommended_route = primary_ai if primary_ai in ("gemini", "groq") else "gemini"
    else:
        classification = "simple"
        recommended_route = "ocr"

    return {
        "classification": classification,
        "score": final_score,
        "threshold": threshold,
        "recommended_route": recommended_route,
        "extraction_coverage": extraction_coverage,
        "signals": signals,
        "reasons": reasons,
    }
