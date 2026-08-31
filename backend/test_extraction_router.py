"""
Unit tests for Extraction Router Service (backend/app/services/extraction_router.py).

Verifies routing logic, conservative fallbacks, non-mutation guarantees, and zero Groq API calls.
"""

import unittest
from unittest.mock import patch
from app.models.land_record import LandRecord, ExtractedField
from app.services.extraction_router import route_document


class TestExtractionRouter(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        self.simple_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

    def test_11_simple_document_routes_to_ocr(self):
        """TEST 11: Simple document routes to 'ocr'."""
        result = route_document(
            ocr_text="गाव: अंबाजोगाई",
            record=self.simple_record,
            validation={"status": "valid"},
        )
        self.assertEqual(result["route"], "ocr")
        self.assertIn("reason", result)
        self.assertIn("complexity", result)

    def test_12_complex_document_routes_to_groq(self):
        """TEST 12: Complex document routes to 'groq'."""
        complex_text = "\n".join(
            [f"Line {i}: पिकांचे नाव, हंगाम, जलसिंचन, इतर अधिकार सामायिक मयत वारस" for i in range(30)]
        )
        missing_record = LandRecord(
            district=ExtractedField(value=None, confidence=0.0),
            taluka=ExtractedField(value=None, confidence=0.0),
        )
        bad_val = {"status": "needs_review", "fields": {"survey_reference": {"status": "possible_error"}}}

        result = route_document(
            ocr_text=complex_text,
            record=missing_record,
            validation=bad_val,
            page_count=2,
        )
        self.assertEqual(result["route"], "groq")
        self.assertGreaterEqual(result["complexity"]["score"], 0.50)

    def test_13_uncertain_document_fallback_ocr(self):
        """TEST 13: Uncertain or error state conservatively routes to 'ocr'."""
        with patch("app.services.extraction_router.analyze_document_complexity") as mock_analyzer:
            mock_analyzer.side_effect = Exception("Unexpected analysis failure")

            result = route_document(ocr_text="sample text")
            self.assertEqual(result["route"], "ocr")
            self.assertIn("fallback", result["reason"].lower())

    def test_14_router_does_not_invoke_groq(self):
        """TEST 14: Router execution consumes zero network API calls to Groq."""
        with patch("app.services.groq_service.GroqService") as mock_groq_service:
            _ = route_document(ocr_text="some text", record=self.simple_record)
            mock_groq_service.assert_not_called()

    def test_15_returns_complexity_diagnostics(self):
        """TEST 15: Router returns complete complexity diagnostic payload."""
        result = route_document(ocr_text="some text", record=self.simple_record)
        self.assertIn("complexity", result)
        complexity = result["complexity"]

        self.assertIn("classification", complexity)
        self.assertIn("score", complexity)
        self.assertIn("threshold", complexity)
        self.assertIn("signals", complexity)
        self.assertIn("reasons", complexity)

    def test_16_router_does_not_mutate_ocr_text(self):
        """TEST 16: Router does not modify input OCR text string."""
        original_text = "गाव: अंबाजोगाई\nतालुका: अंबाजोगाई"
        text_copy = str(original_text)

        _ = route_document(ocr_text=text_copy, record=self.simple_record)
        self.assertEqual(original_text, text_copy)

    def test_17_router_does_not_mutate_land_record(self):
        """TEST 17: Router does not modify input LandRecord object."""
        record_dump_before = self.simple_record.model_dump()
        _ = route_document(ocr_text="some text", record=self.simple_record)
        record_dump_after = self.simple_record.model_dump()

        self.assertEqual(record_dump_before, record_dump_after)

    def test_18_router_does_not_change_validation(self):
        """TEST 18: Router does not modify input validation dictionary."""
        val_dict = {"status": "valid", "fields": {}}
        val_copy = dict(val_dict)

        _ = route_document(ocr_text="some text", record=self.simple_record, validation=val_dict)
        self.assertEqual(val_dict, val_copy)


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestExtractionRouter)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "Extraction router unit tests failed!"


if __name__ == "__main__":
    run_tests()
