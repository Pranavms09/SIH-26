"""
Unit tests for AI Validation Service Adapter (backend/app/services/ai_validation_service.py).

Verifies the 12 required test conditions connecting AI Vision LandRecord output
to the authoritative existing validation system.
"""

import unittest
from app.models.land_record import LandRecord, ExtractedField
from app.services.ai_validation_service import validate_ai_record, process_and_validate_vision_image
from app.services.validation_service import validate_land_record


class TestAIValidation(unittest.TestCase):
    def setUp(self):
        """Create a standard valid Marathi 7/12 LandRecord fixture."""
        self.valid_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

    def test_01_valid_ai_record_passes_validation(self):
        """TEST 1: Valid AI-generated LandRecord passes through existing validation."""
        result = validate_ai_record(self.valid_record)
        self.assertEqual(result["source"], "groq_vision")
        self.assertEqual(result["validation"]["status"], "valid")
        self.assertIn("fields", result["validation"])

    def test_02_correct_location_hierarchy(self):
        """TEST 2: Correct district/taluka/village produces valid location hierarchy status."""
        result = validate_ai_record(self.valid_record)
        location_res = result["validation"]["fields"]["location_hierarchy"]
        self.assertEqual(location_res["status"], "valid")

    def test_03_correct_survey_reference(self):
        """TEST 3: Correct survey number produces valid survey reference status."""
        result = validate_ai_record(self.valid_record)
        survey_res = result["validation"]["fields"]["survey_reference"]
        self.assertEqual(survey_res["status"], "valid")

    def test_04_incorrect_survey_flagged(self):
        """TEST 4: Incorrect survey number produces possible_error/invalid without being overridden by AI confidence."""
        # AI returns high confidence 0.99 for invalid survey "3312/2"
        ai_record = self.valid_record.model_copy(deep=True)
        ai_record.survey_number = ExtractedField(value="3312/2", confidence=0.99)

        result = validate_ai_record(ai_record)
        survey_ref = result["validation"]["fields"]["survey_reference"]

        # Validation must flag possible_error or invalid despite 0.99 AI confidence
        self.assertIn(survey_ref["status"], {"possible_error", "not_found", "invalid"})

        # High AI confidence must NOT override overall review status
        self.assertEqual(result["validation"]["status"], "needs_review")

    def test_05_unknown_location_handling(self):
        """TEST 5: Unknown location does not crash validation and marks hierarchy as unknown."""
        ai_record = self.valid_record.model_copy(deep=True)
        ai_record.village = ExtractedField(value="अज्ञात_गाव", confidence=0.90)

        result = validate_ai_record(ai_record)
        loc_res = result["validation"]["fields"]["location_hierarchy"]
        self.assertEqual(loc_res["status"], "unknown")
        self.assertEqual(result["validation"]["status"], "needs_review")

    def test_06_malformed_area_triggers_consistency(self):
        """TEST 6: Malformed area format triggers area verification status."""
        ai_record = self.valid_record.model_copy(deep=True)
        ai_record.area = ExtractedField(value="24 acres", confidence=0.90)

        result = validate_ai_record(ai_record)
        area_res = result["validation"]["fields"]["area"]
        self.assertEqual(area_res["status"], "review")
        self.assertEqual(result["validation"]["status"], "needs_review")

    def test_07_suspicious_owner_triggers_consistency(self):
        """TEST 7: Suspicious owner triggers consistency validation check."""
        ai_record = self.valid_record.model_copy(deep=True)
        ai_record.owner_name = ExtractedField(value="12345 ABC", confidence=0.85)

        result = validate_ai_record(ai_record)
        consistency_res = result["validation"]["fields"]["cross_field_consistency"]
        self.assertIn("owner_name", consistency_res.get("issues", {}))
        self.assertEqual(result["validation"]["status"], "needs_review")

    def test_08_ai_confidence_unchanged(self):
        """TEST 8: AI confidence values remain unchanged after validation."""
        initial_conf = self.valid_record.survey_number.confidence
        _ = validate_ai_record(self.valid_record)
        self.assertEqual(self.valid_record.survey_number.confidence, initial_conf)

    def test_09_no_ai_value_mutation(self):
        """TEST 9: Validation does not mutate LandRecord field values."""
        ai_record = self.valid_record.model_copy(deep=True)
        ai_record.survey_number = ExtractedField(value="3312/2", confidence=0.95)

        initial_val = ai_record.survey_number.value
        result = validate_ai_record(ai_record)

        # Confirm original AI record value is strictly unchanged
        self.assertEqual(ai_record.survey_number.value, initial_val)
        self.assertEqual(ai_record.survey_number.value, "3312/2")

        # Confirm validation suggestion exists inside validation payload without mutating record
        survey_ref = result["validation"]["fields"]["survey_reference"]
        if "suggested_value" in survey_ref:
            self.assertEqual(survey_ref["suggested_value"], "312/2")

    def test_10_marathi_unicode_survival(self):
        """TEST 10: Devanagari Marathi Unicode values survive validation unchanged."""
        result = validate_ai_record(self.valid_record)
        rec = result["record"]
        self.assertEqual(rec.district.value, "बीड")
        self.assertEqual(rec.taluka.value, "अंबाजोगाई")
        self.assertEqual(rec.village.value, "अंबाजोगाई (रुरल)")
        self.assertEqual(rec.owner_name.value, "विलासराव पाटील")

    def test_11_validation_structure_matches(self):
        """TEST 11: Validation structure matches existing rule-based validation structure."""
        result = validate_ai_record(self.valid_record)
        val = result["validation"]

        self.assertIn("status", val)
        self.assertIn("fields", val)

        fields = val["fields"]
        required_keys = {
            "district",
            "taluka",
            "village",
            "survey_number",
            "owner_name",
            "area",
            "location_hierarchy",
            "survey_reference",
            "cross_field_consistency",
        }
        self.assertTrue(required_keys.issubset(fields.keys()))

    def test_12_existing_validation_tests_continue_to_pass(self):
        """TEST 12: Existing validation service behaves consistently."""
        rule_based_val = validate_land_record(self.valid_record)
        ai_val = validate_ai_record(self.valid_record)["validation"]
        self.assertEqual(rule_based_val, ai_val)


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAIValidation)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "AI validation unit tests failed!"


if __name__ == "__main__":
    run_tests()
