from app.services.reference_service import validate_survey_reference


def run_tests():
    print("\n========== SURVEY REFERENCE VALIDATION TESTS ==========\n")

    # TEST 1 — Exact match
    res1 = validate_survey_reference(
        district="बीड",
        taluka="अंबाजोगाई",
        village="अंबाजोगाई (रुरल)",
        survey_number="312/2"
    )
    print("TEST 1 (Exact match):")
    print(res1)
    assert res1["status"] == "valid", f"Expected 'valid', got {res1['status']}"
    assert res1["matched_value"] == "312/2"
    assert res1["similarity"] == 1.0

    # TEST 2 — Possible OCR error
    res2 = validate_survey_reference(
        district="बीड",
        taluka="अंबाजोगाई",
        village="अंबाजोगाई (रुरल)",
        survey_number="3312/2"
    )
    print("\nTEST 2 (Possible OCR error):")
    print(res2)
    assert res2["status"] == "possible_error", f"Expected 'possible_error', got {res2['status']}"
    assert res2["extracted_value"] == "3312/2"
    assert res2["suggested_value"] == "312/2"

    # TEST 3 — Completely invalid survey number
    res3 = validate_survey_reference(
        district="बीड",
        taluka="अंबाजोगाई",
        village="अंबाजोगाई (रुरल)",
        survey_number="9999/99"
    )
    print("\nTEST 3 (Completely invalid):")
    print(res3)
    assert res3["status"] == "invalid", f"Expected 'invalid', got {res3['status']}"

    # TEST 4 — Unknown location
    res4 = validate_survey_reference(
        district="पुणे",
        taluka="अंबाजोगाई",
        village="अंबाजोगाई (रुरल)",
        survey_number="312/2"
    )
    print("\nTEST 4 (Unknown location):")
    print(res4)
    assert res4["status"] == "unknown", f"Expected 'unknown', got {res4['status']}"

    print("\n=======================================================\n")
    print("ALL SURVEY REFERENCE VALIDATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_tests()
