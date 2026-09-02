"""
Unit tests for Document Complexity Service (backend/app/services/document_complexity_service.py).

Verifies multi-signal scoring, score bounding, explainable reasons, and deterministic classification.
"""

import unittest
from app.models.land_record import LandRecord, ExtractedField
from app.services.document_complexity_service import analyze_document_complexity


class TestDocumentComplexity(unittest.TestCase):
    def setUp(self):
        """Set up standard simple record fixture."""
        self.simple_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )
        self.simple_validation = {
            "status": "valid",
            "fields": {
                "survey_reference": {"status": "valid"},
                "cross_field_consistency": {"status": "valid"},
            },
        }

    def test_01_simple_document_low_score(self):
        """TEST 1: Simple clean document produces low complexity score (<0.50)."""
        ocr_text = "गाव: अंबाजोगाई\nतालुका: अंबाजोगाई\nजिल्हा: बीड\nविलासराव पाटील"
        res = analyze_document_complexity(
            ocr_text=ocr_text,
            record=self.simple_record,
            validation=self.simple_validation,
        )

        self.assertEqual(res["classification"], "simple")
        self.assertEqual(res["recommended_route"], "ocr")
        self.assertLess(res["score"], 0.50)

    def test_02_dense_document_high_score(self):
        """TEST 2: Dense multi-section document produces higher complexity score (>=0.50)."""
        # Complex multi-line OCR text with missing fields, validation failures, table keywords, multiple owners
        complex_text = "\n".join(
            [f"Line {i}: पिकांचे नाव, हंगाम, जलसिंचन, इतर अधिकार सामायिक मयत वारस बोजा" for i in range(30)]
        )
        missing_record = LandRecord(
            district=ExtractedField(value=None, confidence=0.0),
            taluka=ExtractedField(value=None, confidence=0.0),
            village=ExtractedField(value=None, confidence=0.0),
            survey_number=ExtractedField(value=None, confidence=0.0),
        )
        bad_validation = {
            "status": "needs_review",
            "fields": {
                "survey_reference": {"status": "possible_error"},
                "cross_field_consistency": {"status": "suspicious"},
            },
        }

        res = analyze_document_complexity(
            ocr_text=complex_text,
            record=missing_record,
            validation=bad_validation,
            page_count=2,
        )

        self.assertEqual(res["classification"], "complex")
        self.assertIn(res["recommended_route"], ("gemini", "groq"))
        self.assertGreaterEqual(res["score"], 0.50)

    def test_03_missing_fields_increase_score(self):
        """TEST 3: Missing fields increase difficulty score without forcing complex alone."""
        partial_record = self.simple_record.model_copy(deep=True)
        partial_record.district = ExtractedField(value=None, confidence=0.0)
        partial_record.taluka = ExtractedField(value=None, confidence=0.0)

        res_complete = analyze_document_complexity(
            ocr_text="short text",
            record=self.simple_record,
            validation=self.simple_validation,
        )
        res_partial = analyze_document_complexity(
            ocr_text="short text",
            record=partial_record,
            validation=self.simple_validation,
        )

        self.assertGreater(res_partial["score"], res_complete["score"])

    def test_04_multiple_owners_increase_score(self):
        """TEST 4: Multiple owner structure increases complexity score."""
        ocr_text_single = "माहिती: विलासराव पाटील"
        ocr_text_multi = "माहिती: विलासराव पाटील आणि रमेश पाटील सामायिक वारस मयत"

        res_single = analyze_document_complexity(ocr_text=ocr_text_single, record=self.simple_record)
        res_multi = analyze_document_complexity(ocr_text=ocr_text_multi, record=self.simple_record)

        self.assertGreater(res_multi["score"], res_single["score"])
        self.assertIn("owner_complexity", res_multi["signals"])

    def test_05_table_heavy_content_increases_score(self):
        """TEST 5: Table-heavy content increases complexity score."""
        table_text = "पिकांचे नाव\nहंगाम\nजलसिंचन\n" + "\n".join([f"row {i}" for i in range(26)])

        res = analyze_document_complexity(ocr_text=table_text, record=self.simple_record)
        table_sig = res["signals"]["table_density"]
        self.assertGreater(table_sig["score"], 0.0)

    def test_06_ocr_text_density_increases_score(self):
        """TEST 6: OCR text density and page count increase complexity score."""
        short_text = "Hello world"
        long_text = "Detailed text string content " * 30

        res_short = analyze_document_complexity(ocr_text=short_text, page_count=1)
        res_long = analyze_document_complexity(ocr_text=long_text, page_count=3)

        self.assertGreater(res_long["score"], res_short["score"])

    def test_07_validation_problems_contribute(self):
        """TEST 7: Validation problems contribute to complexity score."""
        bad_val = {
            "status": "needs_review",
            "fields": {
                "survey_reference": {"status": "possible_error"},
                "cross_field_consistency": {"status": "suspicious"},
            },
        }

        res_valid = analyze_document_complexity(record=self.simple_record, validation=self.simple_validation)
        res_invalid = analyze_document_complexity(record=self.simple_record, validation=bad_val)

        self.assertGreater(res_invalid["score"], res_valid["score"])

    def test_08_score_bounded(self):
        """TEST 8: Complexity score is strictly bounded between 0.0 and 1.0."""
        res_empty = analyze_document_complexity(ocr_text="", record=None)
        self.assertGreaterEqual(res_empty["score"], 0.0)
        self.assertLessEqual(res_empty["score"], 1.0)

        huge_text = "पिकांचे नाव हंगाम जलसिंचन सामायिक मयत\n" * 100
        res_huge = analyze_document_complexity(ocr_text=huge_text, page_count=10)
        self.assertGreaterEqual(res_huge["score"], 0.0)
        self.assertLessEqual(res_huge["score"], 1.0)

    def test_09_classification_deterministic(self):
        """TEST 9: Classification is 100% deterministic given identical inputs."""
        res1 = analyze_document_complexity(ocr_text="गाव: अंबाजोगाई", record=self.simple_record)
        res2 = analyze_document_complexity(ocr_text="गाव: अंबाजोगाई", record=self.simple_record)

        self.assertEqual(res1["score"], res2["score"])
        self.assertEqual(res1["classification"], res2["classification"])

    def test_10_explainable_reasons_returned(self):
        """TEST 10: Explainable reasons list is generated and returned."""
        res = analyze_document_complexity(ocr_text="गाव: अंबाजोगाई", record=self.simple_record)
        self.assertIn("reasons", res)
        self.assertIsInstance(res["reasons"], list)
        self.assertTrue(len(res["reasons"]) > 0)


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestDocumentComplexity)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "Document complexity unit tests failed!"


if __name__ == "__main__":
    run_tests()
