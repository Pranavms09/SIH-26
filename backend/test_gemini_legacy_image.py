"""
Diagnostic test script for Gemini Vision on legacy land record documents.
Tests raw description, unconstrained extraction, and structured extraction directly.
"""

import sys
import json
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_gemini_api_key, get_gemini_model
from app.services.gemini_service import GeminiService, encode_file_for_gemini
from app.services.gemini_vision_extractor import extract_land_record_with_gemini

def run_diagnostic(image_path: str):
    print("=" * 60)
    print(f"RUNNING GEMINI VISION DIAGNOSTIC FOR: {image_path}")
    print("=" * 60)

    path = Path(image_path)
    if not path.exists():
        print(f"Error: File not found: {image_path}")
        return

    # 1. File metadata
    size_kb = path.stat().st_size / 1024
    mime_type, _ = encode_file_for_gemini(str(path))
    
    import cv2
    img = cv2.imread(str(path))
    dims = f"{img.shape[1]}x{img.shape[0]}" if img is not None else "Unknown"

    print(f"Image Path:       {image_path}")
    print(f"File Size:        {size_kb:.1f} KB")
    print(f"MIME Type:        {mime_type}")
    print(f"Image Dimensions: {dims}")
    print(f"Gemini Model:     {get_gemini_model()}")
    print("-" * 60)

    service = GeminiService()
    if not service.is_configured():
        print("Error: GEMINI_API_KEY is not configured!")
        return

    # TEST A: Simple visual description test (Point 5 in prompt)
    print("\n>>> TEST A: Unconstrained Visual Description Prompt")
    desc_prompt = (
        "Describe what you can see and read from this document image. "
        "Identify the document type, language, administrative location names (district, taluka, village), "
        "survey numbers, owner names, land area, and any visible Marathi or Devanagari text."
    )
    try:
        resp_a = service.generate_gemini_completion(
            file_path=str(path),
            prompt=desc_prompt,
            json_mode=False,
            temperature=0.1,
            max_tokens=1024
        )
        print("--- RAW GEMINI DESCRIPTION RESULT ---")
        print(resp_a.strip())
        print("-------------------------------------")
    except Exception as e:
        print(f"TEST A ERROR: {e}")

    # TEST B: Unconstrained full text reading (Point 6 in prompt)
    print("\n>>> TEST B: Full Text Extraction Prompt (No JSON schema)")
    read_prompt = (
        "Extract every clearly readable piece of text from this document image. "
        "Preserve Marathi and Devanagari script exactly. Do not translate to English. "
        "List all visible names, numbers, headers, and values."
    )
    try:
        resp_b = service.generate_gemini_completion(
            file_path=str(path),
            prompt=read_prompt,
            json_mode=False,
            temperature=0.1,
            max_tokens=1024
        )
        print("--- RAW GEMINI READ RESULT ---")
        print(resp_b.strip())
        print("------------------------------")
    except Exception as e:
        print(f"TEST B ERROR: {e}")

    # TEST C: Structured extraction (Point 7 in prompt)
    print("\n>>> TEST C: Structured LandRecord Extraction")
    try:
        record = extract_land_record_with_gemini(str(path))
        print("--- EXTRACTED LAND RECORD MODEL ---")
        print(json.dumps(record.model_dump(), indent=2, ensure_ascii=False))
        print("-----------------------------------")
        
        non_null = sum(1 for v in record.model_dump().values() if v.get("value") is not None)
        print(f"Final Non-Null Fields: {non_null}/7")
    except Exception as e:
        print(f"TEST C ERROR: {e}")

if __name__ == "__main__":
    # Find sample files in uploads
    uploads_dir = Path(__file__).parent / "uploads"
    jpg_files = list(uploads_dir.glob("*.jpg")) + list(uploads_dir.glob("*.png"))
    
    if jpg_files:
        sample = str(jpg_files[0])
        print(f"Found upload sample: {sample}")
        run_diagnostic(sample)
    else:
        print("No sample image found in uploads folder.")
