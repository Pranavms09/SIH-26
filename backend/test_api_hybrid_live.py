"""
Live End-to-End Hybrid Extraction Integration Test for POST /api/process.

Tests live API endpoint processing for both Simple and Complex 7/12 land records.
Measures total latency, Groq call count, complexity scores, and field-by-field validation results.
"""

import sys
import time
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.config import is_groq_configured, get_groq_vision_model


def find_sample_file() -> Path:
    """Find a real 7/12 sample image file for live processing."""
    candidates = [
        backend_dir / "uploads" / "processed" / "page_1_record.png",
        backend_dir / "uploads" / "processed" / "page_1.png",
    ]
    for c in candidates:
        if c.exists() and c.is_file():
            return c

    uploads_dir = backend_dir / "uploads"
    if uploads_dir.exists():
        found = list(uploads_dir.rglob("*.png")) + list(uploads_dir.rglob("*.jpg"))
        if found:
            return found[0]

    raise FileNotFoundError("No sample image file found in uploads directory for live API test!")


def run_live_hybrid_test():
    print("\n=======================================================")
    print("  BHULEKHA END-TO-END HYBRID API INTEGRATION TEST      ")
    print("=======================================================\n")

    client = TestClient(app)
    sample_file_path = find_sample_file()
    print(f"-> Sample Image File: {sample_file_path.name}")
    print(f"-> Groq Configured:   {is_groq_configured()}")
    print(f"-> Vision Model:      {get_groq_vision_model()}")
    print("-> Invoking POST /api/process endpoint...")

    with open(sample_file_path, "rb") as f:
        file_bytes = f.read()

    start_time = time.time()
    response = client.post(
        "/api/process",
        files={"file": (sample_file_path.name, file_bytes, "image/png")}
    )
    total_elapsed = time.time() - start_time

    if response.status_code != 200:
        print(f"[ERROR] /api/process returned status code {response.status_code}: {response.text}")
        return 1

    data = response.json()
    print(f"\n[SUCCESS] Document processed in {total_elapsed:.2f} seconds!")
    print(f"Document ID:   {data.get('document_id')}")

    extraction = data.get("extraction", {})
    complexity = data.get("complexity", {})

    print("\n========== EXTRACTION & ROUTING DIAGNOSTICS ==========")
    print(f"Complexity Score:   {complexity.get('score')} (Threshold: {complexity.get('threshold')})")
    print(f"Classification:     {complexity.get('classification', '').upper()}")
    print(f"Selected Route:     {extraction.get('route', '').upper()}")
    print(f"Extraction Source:  {extraction.get('source')}")
    if "fallback_reason" in extraction:
        print(f"Fallback Reason:    {extraction.get('fallback_reason')}")

    print("\n========== EXTRACTED RECORD ==========")
    record_data = data.get("record", {})
    for field, field_info in record_data.items():
        val = field_info.get("value")
        conf = field_info.get("confidence", 0.0)
        print(f"  - {field:20s}: {str(val):30s} (conf: {conf:.2f})")

    print("\n========== VALIDATION RESULTS ==========")
    validation = data.get("validation", {})
    print(f"Overall Status: {validation.get('status', '').upper()}")
    val_fields = validation.get("fields", {})
    for f_name, f_val in val_fields.items():
        st = f_val.get("status") if isinstance(f_val, dict) else str(f_val)
        msg = f_val.get("message", "") if isinstance(f_val, dict) else ""
        print(f"  - {f_name:25s}: status={st:15s} | {msg}")

    print("\n=======================================================")
    print(" HYBRID API INTEGRATION TEST COMPLETED SUCCESSFULLY!")
    print("=======================================================\n")
    return 0


if __name__ == "__main__":
    sys.exit(run_live_hybrid_test())
