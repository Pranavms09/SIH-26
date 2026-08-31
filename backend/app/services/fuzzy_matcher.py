from difflib import SequenceMatcher
from typing import Optional, List, Dict, Any


def similarity(a: str, b: str) -> float:
    """
    Calculate similarity ratio between two strings using difflib.SequenceMatcher.
    Returns a float from 0.0 to 1.0.
    """
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def find_best_match(
    value: str,
    candidates: List[str],
    threshold: float = 0.70
) -> Optional[Dict[str, Any]]:
    """
    Find the candidate string with the highest similarity ratio to value.
    Returns dict with value and similarity if similarity >= threshold, else None.
    """
    if not value or not candidates:
        return None

    best_candidate = None
    best_similarity = 0.0

    for candidate in candidates:
        score = similarity(value, candidate)
        if score > best_similarity:
            best_similarity = score
            best_candidate = candidate

    if best_candidate and best_similarity >= threshold:
        return {
            "value": best_candidate,
            "similarity": round(best_similarity, 2)
        }

    return None
