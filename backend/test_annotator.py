"""
Test suite for BhuLekha Local NER Annotation Workflow & Intelligent Pre-Annotation.
Verifies raw sample loading, pre-annotation suggestions generation, exact offset verification,
overlap rejection, dataset appending/updating, manifest state transitions, and raw sample immutability.
"""

import json
from pathlib import Path
from fastapi.testclient import TestClient

from tools.annotator.app import app, DATASET_PATH, MANIFEST_PATH, RAW_DIR
from tools.save_ner_raw_sample import save_raw_sample

client = TestClient(app)


def run_tests():
    print("\n========== LOCAL NER ANNOTATOR & PRE-ANNOTATION TESTS ==========\n")

    doc_id = "test-annotator-doc-99"
    filename = "test_annotation_doc.pdf"

    ocr_text = (
        "गाव:- अंबाजोगाई (रुरल) (560022)\n"
        "तालुका:- अंबाजोगाई\n"
        "जिल्हा: बीड\n"
        "भूमापन क्रमांक व उपविभाग: 312/2\n"
        "भू-धारणापध्दती: भोगवटादार वर्ग-1\n"
        "विलासराव पाटील\n"
        "क्षेत्र 0.24.00"
    )
    text_len = len(ocr_text)

    pages = [{"page_number": 1, "text": ocr_text}]
    dummy_record = {"district": {"value": "बीड"}}
    dummy_val = {"status": "valid"}

    # 1. Create a raw sample
    raw_path = save_raw_sample(
        document_id=doc_id,
        filename=filename,
        pages=pages,
        record=dummy_record,
        validation=dummy_val
    )

    mtime_before = raw_path.stat().st_mtime
    content_before = raw_path.read_text(encoding="utf-8")

    # 2. Test sample loading endpoint
    print("1. Testing GET /api/sample/{document_id}...")
    res = client.get(f"/api/sample/{doc_id}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["document_id"] == doc_id
    assert data["text"] == ocr_text
    print("✓ Raw sample loaded and OCR text preserved.")

    # 3. Test STEP 15E Pre-Annotation Suggestions Endpoint
    print("\n2. Testing STEP 15E GET /api/sample/{document_id}/suggestions...")
    res_sugg = client.get(f"/api/sample/{doc_id}/suggestions")
    assert res_sugg.status_code == 200, f"Expected 200, got {res_sugg.status_code}"
    sugg_data = res_sugg.json()
    assert sugg_data["document_id"] == doc_id
    suggestions = sugg_data.get("suggestions", [])
    assert len(suggestions) > 0, "Expected pre-annotation suggestions to be generated"
    print(f"✓ Generated {len(suggestions)} pre-annotation suggestions.")

    # Verify each suggestion format and character offsets
    print("   Verifying pre-annotation suggestion character offsets against raw text...")
    for s in suggestions:
        st = s["start"]
        en = s["end"]
        val = s["value"]
        lbl = s["label"]
        conf = s["confidence"]
        src = s["source"]

        assert 0 <= st < en <= text_len, f"Invalid suggestion range [{st}:{en}] for length {text_len}"
        assert ocr_text[st:en] == val, f"Suggestion slice mismatch: expected '{val}', got '{ocr_text[st:en]}'"
        assert src == "rule_based_extractor"
        assert conf > 0.0
        print(f"   - Label: {lbl:17s} | Val: '{val}' [{st}:{en}] | Conf: {conf}")

    # 4. Test Invalid span rejection (start > end)
    print("\n3. Testing invalid span offsets rejection (start > end)...")
    invalid_payload = {
        "document_id": doc_id,
        "entities": [
            {"start": 100, "end": 50, "label": "VILLAGE"}
        ]
    }
    res_inv = client.post("/api/annotate", json=invalid_payload)
    assert res_inv.status_code == 400, "Expected 400 for invalid span"
    print("✓ Invalid offset span rejected.")

    # 5. Test Overlapping spans rejection
    print("\n4. Testing overlapping entity spans rejection...")
    overlap_payload = {
        "document_id": doc_id,
        "entities": [
            {"start": 6, "end": 22, "label": "VILLAGE"},  # "अंबाजोगाई (रुरल)"
            {"start": 15, "end": 20, "label": "TALUKA"}   # Overlaps with VILLAGE
        ]
    }
    res_ov = client.post("/api/annotate", json=overlap_payload)
    assert res_ov.status_code == 400, "Expected 400 for overlapping spans"
    print("✓ Overlapping entity spans rejected.")

    # 6. REGRESSION TEST: end == len(text) (accepted) vs end > len(text) (rejected)
    print(f"\n5. Regression Test: Marathi text boundary (len(text) = {text_len})...")
    
    # 6a. end > len(text) MUST BE REJECTED
    out_of_bounds_payload = {
        "document_id": doc_id,
        "entities": [
            {"start": 151, "end": text_len + 1, "label": "AREA"}  # 159 > 158
        ]
    }
    res_oob = client.post("/api/annotate", json=out_of_bounds_payload)
    assert res_oob.status_code == 400, f"Expected 400 when end ({text_len + 1}) > len(text) ({text_len})"
    assert "exceeds text length" in res_oob.json().get("detail", "")
    print(f"✓ Rejection verified: end ({text_len + 1}) > len(text) ({text_len}) rejected with 400.")

    # 6b. end == len(text) MUST BE ACCEPTED
    exact_boundary_payload = {
        "document_id": doc_id,
        "entities": [
            {"start": 151, "end": text_len, "label": "AREA"}  # 158 == 158 ("0.24.00")
        ]
    }
    res_exact = client.post("/api/annotate", json=exact_boundary_payload)
    assert res_exact.status_code == 200, f"Expected 200 when end ({text_len}) == len(text) ({text_len}), got {res_exact.status_code}"
    print(f"✓ Acceptance verified: end ({text_len}) == len(text) ({text_len}) accepted with 200.")

    # 7. Test Valid Full Annotation Saving (Accepting suggestions)
    print("\n6. Testing valid full annotation saving (accepting suggestions)...")
    valid_payload = {
        "document_id": doc_id,
        "entities": [
            {"start": 6, "end": 22, "label": "VILLAGE"},
            {"start": 41, "end": 50, "label": "TALUKA"},
            {"start": 59, "end": 62, "label": "DISTRICT"},
            {"start": 89, "end": 94, "label": "SURVEY_NUMBER"},
            {"start": 112, "end": 128, "label": "LAND_HOLDING_TYPE"},
            {"start": 129, "end": 143, "label": "OWNER_NAME"},
            {"start": 151, "end": 158, "label": "AREA"}
        ]
    }
    res_valid = client.post("/api/annotate", json=valid_payload)
    assert res_valid.status_code == 200, f"Expected 200, got {res_valid.status_code}: {res_valid.text}"
    print("✓ Valid annotation saved successfully.")

    # 8. Verify land_records.jsonl updated
    print("\n7. Verifying land_records.jsonl dataset update...")
    assert DATASET_PATH.exists()
    jsonl_content = DATASET_PATH.read_text(encoding="utf-8")
    assert ocr_text in jsonl_content
    print("✓ land_records.jsonl updated with annotated record.")

    # 9. Verify manifest updated (raw -> annotated)
    print("\n8. Verifying manifest status change...")
    manifest_data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    matching = [s for s in manifest_data["samples"] if s["document_id"] == doc_id]
    assert len(matching) == 1
    assert matching[0]["status"] == "annotated"
    assert matching[0]["annotated"] is True
    print("✓ Manifest status updated to 'annotated'.")

    # 10. Verify raw sample immutability
    print("\n9. Verifying raw sample file immutability...")
    content_after = raw_path.read_text(encoding="utf-8")
    assert content_before == content_after, "Raw sample JSON was modified!"
    print("✓ Raw JSON file remains 100% unchanged.")

    print("\n=======================================================\n")
    print("ALL ANNOTATOR & PRE-ANNOTATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
