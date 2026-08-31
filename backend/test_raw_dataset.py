"""
Test suite for raw NER dataset collection pipeline.
Verifies sample creation, schema validation, UTF-8 Marathi string retention, and manifest tracking.
"""

import json
from pathlib import Path
from tools.save_ner_raw_sample import save_raw_sample, RAW_DIR, MANIFEST_PATH
from app.models.land_record import LandRecord, ExtractedField


def run_tests():
    print("\n========== RAW NER DATASET COLLECTION TESTS ==========\n")

    doc_id = "test-raw-doc-12345"
    filename = "sample_land_record.pdf"

    pages = [
        {
            "page_number": 1,
            "text": (
                "गाव:- अंबाजोगाई (रुरल) (560022)\n"
                "तालुका:- अंबाजोगाई\n"
                "जिल्हा: बीड\n"
                "भूमापन क्रमांक व उपविभाग: 312/2\n"
                "भू-धारणापध्दती: भोगवटादार वर्ग-1\n"
                "विलासराव पाटील\n"
                "क्षेत्र 0.24.00"
            )
        }
    ]

    record = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल) (560022)", confidence=0.95),
        survey_number=ExtractedField(value="312/2", confidence=0.90),
        land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
        owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
        area=ExtractedField(value="0.24.00", confidence=0.85)
    )

    validation = {
        "status": "valid",
        "message": "All fields consistent",
        "fields": {}
    }

    # 1. Save raw sample
    saved_path = save_raw_sample(
        document_id=doc_id,
        filename=filename,
        pages=pages,
        record=record,
        validation=validation
    )

    # 2. Verify file existence
    print(f"1. Saved Path Verification: {saved_path}")
    assert saved_path.exists(), f"Raw sample file does not exist: {saved_path}"

    # 3. Read back and verify fields
    with open(saved_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("\n2. Payload Fields Verification:")
    print(f"  document_id: {data.get('document_id')}")
    assert data["document_id"] == doc_id
    assert data["filename"] == filename
    assert len(data["ocr_pages"]) == 1
    assert "अंबाजोगाई" in data["ocr_pages"][0]["text"]

    extracted = data["extracted_record"]
    assert extracted["district"]["value"] == "बीड"
    assert extracted["taluka"]["value"] == "अंबाजोगाई"
    assert extracted["owner_name"]["value"] == "विलासराव पाटील"

    assert data["validation"]["status"] == "valid"

    # 4. Verify manifest
    print("\n3. Manifest Verification:")
    assert MANIFEST_PATH.exists(), f"Manifest file does not exist: {MANIFEST_PATH}"

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"  total_samples: {manifest.get('total_samples')}")
    assert manifest["total_samples"] >= 1

    matching = [s for s in manifest["samples"] if s["document_id"] == doc_id]
    assert len(matching) == 1, "Expected exactly 1 manifest entry for doc_id"
    entry = matching[0]
    assert entry["filename"] == filename
    assert entry["status"] == "raw"
    assert entry["annotated"] is False

    print("\n=======================================================\n")
    print("ALL RAW DATASET COLLECTION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
