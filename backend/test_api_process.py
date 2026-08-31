import json
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_process_endpoint():
    print("\n========== TESTING /api/process ENDPOINT ==========\n")

    sample_pdf = Path("uploads/0d3d4de5-2048-4310-bd58-12a40205cb14.pdf")
    if not sample_pdf.exists():
        # Fallback to any pdf in uploads
        pdfs = list(Path("uploads").glob("*.pdf"))
        if pdfs:
            sample_pdf = pdfs[0]
        else:
            print("No sample PDF found in uploads/ directory for testing.")
            return

    print(f"Testing with sample PDF: {sample_pdf}")

    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/api/process",
            files={"file": (sample_pdf.name, f, "application/pdf")}
        )

    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    data = response.json()
    print("\n--- Response Keys ---")
    print(list(data.keys()))

    print("\n--- Document ID & Filename ---")
    print(f"document_id: {data.get('document_id')}")
    print(f"filename: {data.get('filename')}")

    print("\n--- Extracted Record ---")
    print(json.dumps(data.get("record"), indent=2, ensure_ascii=False))

    print("\n--- Validation Results ---")
    print(json.dumps(data.get("validation"), indent=2, ensure_ascii=False))

    # Assert expected structure
    assert "document_id" in data
    assert "filename" in data
    assert "pages" in data
    assert "record" in data
    assert "validation" in data

    record = data["record"]
    assert "district" in record
    assert "taluka" in record
    assert "village" in record
    assert "survey_number" in record
    assert "land_holding_type" in record
    assert "owner_name" in record
    assert "area" in record

    validation = data["validation"]
    assert "status" in validation
    assert "fields" in validation

    fields = validation["fields"]
    assert "survey_number" in fields
    assert "survey_reference" in fields
    assert "location_hierarchy" in fields

    print("\n===================================================\n")
    print("END-TO-END /api/process PIPELINE TEST SUCCESSFUL!")

if __name__ == "__main__":
    test_process_endpoint()
