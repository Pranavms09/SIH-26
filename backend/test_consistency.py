from app.models.land_record import LandRecord, ExtractedField
from app.services.consistency_service import validate_record_consistency
from app.services.validation_service import validate_land_record


def run_tests():
    print("\n========== CROSS-FIELD CONSISTENCY TESTS ==========\n")

    # TEST 1 — Normal record
    rec1 = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
        survey_number=ExtractedField(value="312/2", confidence=0.90),
        land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
        owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
        area=ExtractedField(value="0.24.00", confidence=0.85)
    )
    c1 = validate_record_consistency(rec1)
    print("TEST 1 (Normal record consistency):")
    print(c1)
    assert c1["status"] == "valid", f"Expected 'valid', got {c1['status']}"

    # TEST 2 — Suspicious owner (all digits)
    rec2 = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
        survey_number=ExtractedField(value="312/2", confidence=0.90),
        owner_name=ExtractedField(value="123456789", confidence=0.90),
        area=ExtractedField(value="0.24.00", confidence=0.85)
    )
    c2 = validate_record_consistency(rec2)
    print("\nTEST 2 (Suspicious owner - all digits):")
    print(c2)
    assert c2["status"] == "suspicious"
    assert c2["checks"]["owner"]["status"] == "suspicious"

    # TEST 3 — Suspicious owner containing field label
    rec3 = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
        survey_number=ExtractedField(value="312/2", confidence=0.90),
        owner_name=ExtractedField(value="जिल्हा बीड", confidence=0.90),
        area=ExtractedField(value="0.24.00", confidence=0.85)
    )
    c3 = validate_record_consistency(rec3)
    print("\nTEST 3 (Suspicious owner - containing field label):")
    print(c3)
    assert c3["status"] == "suspicious"
    assert c3["checks"]["owner"]["status"] == "suspicious"

    # TEST 4 — Invalid area format
    rec4 = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
        survey_number=ExtractedField(value="312/2", confidence=0.90),
        owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
        area=ExtractedField(value="abc", confidence=0.85)
    )
    c4 = validate_record_consistency(rec4)
    print("\nTEST 4 (Invalid area format):")
    print(c4)
    assert c4["status"] == "invalid"
    assert c4["checks"]["area"]["status"] == "invalid"

    # TEST 5 — Full validation integration with survey error
    rec5 = LandRecord(
        district=ExtractedField(value="बीड", confidence=0.95),
        taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
        village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
        survey_number=ExtractedField(value="3312/2", confidence=0.90),
        owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
        area=ExtractedField(value="0.24.00", confidence=0.85)
    )
    v5 = validate_land_record(rec5)
    print("\nTEST 5 (Full validation integration with survey OCR error):")
    print(v5)
    assert v5["status"] == "needs_review"
    assert v5["fields"]["survey_reference"]["status"] == "possible_error"
    assert "cross_field_consistency" in v5["fields"]

    print("\n=======================================================\n")
    print("ALL CROSS-FIELD CONSISTENCY TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
