"""
Extraction Router Service for BhuLekha.

Determines whether a document should be routed to Path A (Fast, local rule-based OCR)
or Path B (Groq Vision LLM API) using explainable multi-signal complexity scores.

Enforces a conservative fallback preferring local OCR whenever classification is uncertain.
Does NOT invoke external APIs or execute extraction during routing decisions.
"""

from typing import Dict, Any, Optional
from app.models.land_record import LandRecord
from app.services.document_complexity_service import (
    analyze_document_complexity,
    DEFAULT_COMPLEXITY_THRESHOLD,
)


def route_document(
    ocr_text: Optional[str] = None,
    record: Optional[LandRecord] = None,
    validation: Optional[Dict[str, Any]] = None,
    page_count: int = 1,
    threshold: float = DEFAULT_COMPLEXITY_THRESHOLD,
) -> Dict[str, Any]:
    """
    Compute extraction route (Path A: 'ocr' vs Path B: 'groq') for a 7/12 land record.

    Args:
        ocr_text (Optional[str]): Extracted OCR text string.
        record (Optional[LandRecord]): Extracted LandRecord object from rule-based extractor.
        validation (Optional[Dict[str, Any]]): Validation dictionary from validate_land_record().
        page_count (int): Document page count.
        threshold (float): Complexity threshold (default 0.50).

    Returns:
        Dict[str, Any]: Routing payload containing 'route' ('ocr' or 'groq'), 'reason',
                       and full diagnostic 'complexity' payload.
    """
    try:
        complexity = analyze_document_complexity(
            ocr_text=ocr_text,
            record=record,
            validation=validation,
            page_count=page_count,
            threshold=threshold,
        )

        recommended_route = complexity.get("recommended_route", "ocr")
        reasons = complexity.get("reasons", [])
        primary_reason = (
            reasons[0] if reasons else f"Document complexity score is {complexity.get('score', 0.0)}"
        )

        # Confirm conservative fallback rule: if classification is not 'complex', default to 'ocr'
        if recommended_route not in ("ocr", "groq"):
            recommended_route = "ocr"

        return {
            "route": recommended_route,
            "reason": primary_reason,
            "complexity": complexity,
        }

    except Exception as err:
        # Conservative safety fallback: default to local free OCR route on any error
        return {
            "route": "ocr",
            "reason": f"Conservative fallback triggered due to routing error: {str(err)}",
            "complexity": {
                "classification": "simple",
                "score": 0.0,
                "threshold": threshold,
                "recommended_route": "ocr",
                "signals": {},
                "reasons": [f"Error during complexity calculation: {str(err)}"],
            },
        }
