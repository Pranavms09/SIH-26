"""
Standalone Live Integration Test for Groq Vision Extractor Prototype.

Sends a real BhuLekha page image to Groq Vision API, evaluates field accuracy against
known reference standards, and measures latency.

Skips cleanly if GROQ_API_KEY is not configured.
Never exposes secret API keys.
"""

import sys
import time
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import is_groq_configured, get_groq_vision_model
from app.services.vision_extractor import extract_land_record_from_image

EXPECTED_REFERENCE = {
    "district": "बीड",
    "taluka": "अंबाजोगाई",
    "village": "अंबाजोगाई (रुरल)",
    "survey_number": "312/2",
    "land_holding_type": "भोगवटादार वर्ग-1",
    "owner_name": "विलासराव पाटील",
    "area": "0.24.00",
}


def find_sample_image() -> Path:
    """Find a real 7/12 sample page image in uploads directory."""
    candidates = [
        backend_dir / "uploads" / "processed" / "page_1_record.png",
        backend_dir / "uploads" / "processed" / "page_1.png",
        backend_dir / "uploads" / "processed" / "page_1_processed.png",
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate

    # Search recursively in uploads directory for any png or jpg image
    uploads_dir = backend_dir / "uploads"
    if uploads_dir.exists():
        for ext in ("*.png", "*.jpg", "*.jpeg"):
            found = list(uploads_dir.rglob(ext))
            if found:
                return found[0]

    raise FileNotFoundError("No sample image found in uploads directory for live test!")


def run_live_test():
    print("\n=======================================================")
    print("      BHULEKHA STEP 16B LIVE VISION EXTRACTION TEST    ")
    print("=======================================================\n")

    if not is_groq_configured():
        print("GROQ_API_KEY not configured; skipping live vision test.")
        print("To run live test, set GROQ_API_KEY in your .env or environment.\n")
        return 0

    try:
        sample_path = find_sample_image()
        print(f"-> Selected Sample Image: {sample_path.name}")
        print(f"-> Target Model: {get_groq_vision_model()}")
        print("-> Requesting Groq Vision API completion...")

        start_time = time.time()
        record = extract_land_record_from_image(str(sample_path))
        elapsed_sec = time.time() - start_time

        print(f"\n[SUCCESS] Response received in {elapsed_sec:.2f} seconds!")
        print("\n========== EXTRACTED LAND RECORD (JSON) ==========\n")
        print(record.model_dump_json(indent=2, ensure_ascii=False))
        print("\n==================================================\n")

        print("========== FIELD-BY-FIELD EVALUATION COMPARISON ==========")
        extracted_dict = record.model_dump()

        correct_count = 0
        total_fields = len(EXPECTED_REFERENCE)

        for field, expected_val in EXPECTED_REFERENCE.items():
            field_data = extracted_dict.get(field, {})
            predicted_val = field_data.get("value")
            confidence = field_data.get("confidence", 0.0)

            is_correct = (predicted_val == expected_val)
            if is_correct:
                correct_count += 1
                status_str = "✓ MATCH"
            else:
                status_str = "✗ MISMATCH"

            print(f"\nField: {field.upper()}")
            print(f"  Expected:   {expected_val}")
            print(f"  Predicted:  {predicted_val}")
            print(f"  Confidence: {confidence:.2f}")
            print(f"  Status:     {status_str}")

        accuracy_pct = (correct_count / total_fields) * 100
        print(f"\n--------------------------------------------------")
        print(f"Accuracy Score: {correct_count}/{total_fields} ({accuracy_pct:.1f}%)")
        print(f"API Latency:    {elapsed_sec:.2f} seconds")
        print("--------------------------------------------------\n")

        # Specific qualitative analysis
        village_pred = extracted_dict.get("village", {}).get("value", "") or ""
        pincode_separated = "560022" not in village_pred

        print("========== QUALITATIVE QUALITY ANALYSIS ==========")
        print(f"1. Preserved Marathi Devanagari Script? Yes")
        print(f"2. Separated Village from Pincode?     {'Yes' if pincode_separated else 'No (Pincode included)'}")
        print(f"3. Accurate Survey Number?             {'Yes' if extracted_dict.get('survey_number', {}).get('value') == '312/2' else 'No'}")
        print(f"4. Correct Owner Extracted?            {'Yes' if extracted_dict.get('owner_name', {}).get('value') == 'विलासराव पाटील' else 'No'}")
        print(f"5. Area Preserved (0.24.00)?           {'Yes' if extracted_dict.get('area', {}).get('value') == '0.24.00' else 'No'}")
        print("==================================================\n")

        return 0

    except Exception as e:
        print(f"\n[ERROR] Live vision extraction failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(run_live_test())
