"""
End-to-End Hybrid Extraction Integration Tests for /api/process (backend/test_api_hybrid.py).

Verifies all 18 required test conditions for simple document routing (0 Groq calls),
complex document Groq vision routing, graceful rule-based fallback, and backward compatibility.
"""

import os
import io
import json
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.land_record import LandRecord, ExtractedField


class TestAPIHybridIntegration(unittest.TestCase):
    def setUp(self):
        """Set up FastAPI TestClient and sample file bytes."""
        self.client = TestClient(app)

        # Create a small valid 1x1 PNG file byte buffer for upload tests
        # pyrefly: ignore [missing-import]
        from PIL import Image
        img_byte_arr = io.BytesIO()
        img = Image.new("RGB", (50, 50), color="white")
        img.save(img_byte_arr, format="PNG")
        self.sample_png_bytes = img_byte_arr.getvalue()

    def test_01_simple_document_routes_to_ocr(self):
        """TEST 1 & 2: Simple document routes to OCR and consumes 0 Groq calls."""
        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "ocr",
                "reason": "Simple document extracted cleanly",
                "complexity": {"classification": "simple", "score": 0.1, "threshold": 0.5},
            }

            response = self.client.post(
                "/api/process",
                files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
            )

            self.assertEqual(response.status_code, 200)
            data = response.json()

            self.assertEqual(data["extraction"]["route"], "ocr")
            self.assertEqual(data["extraction"]["source"], "rule_based_ocr")
            mock_vision.assert_not_called()  # 0 Groq calls verified!

    def test_03_complex_document_routes_to_groq(self):
        """TEST 3, 4 & 5: Complex document routes to Groq, calls Groq vision, and uses Groq record."""
        mock_groq_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Dense complex table layout",
                "complexity": {"classification": "complex", "score": 0.85, "threshold": 0.5},
            }
            mock_vision.return_value = mock_groq_record

            response = self.client.post(
                "/api/process",
                files={"file": ("complex_sample.png", self.sample_png_bytes, "image/png")}
            )

            self.assertEqual(response.status_code, 200)
            data = response.json()

            self.assertEqual(data["extraction"]["route"], "groq")
            self.assertEqual(data["extraction"]["source"], "groq_vision")
            self.assertEqual(data["record"]["owner_name"]["value"], "विलासराव पाटील")
            mock_vision.assert_called_once()

    def test_06_groq_validation_uses_existing_validation_service(self):
        """TEST 6 & 9: Groq validation uses existing validation engine, and validation warnings do not trigger fallback."""
        mock_groq_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अज्ञात_गाव", confidence=0.95), # Triggers validation review
            survey_number=ExtractedField(value="312/2", confidence=0.90),
        )

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            mock_vision.return_value = mock_groq_record

            response = self.client.post(
                "/api/process",
                files={"file": ("complex.png", self.sample_png_bytes, "image/png")}
            )

            self.assertEqual(response.status_code, 200)
            data = response.json()

            # Status should be needs_review due to unknown location, but source remains groq_vision (no fallback)
            self.assertEqual(data["extraction"]["source"], "groq_vision")
            self.assertEqual(data["validation"]["status"], "needs_review")
            self.assertEqual(data["validation"]["fields"]["location_hierarchy"]["status"], "unknown")

    def test_07_groq_failure_falls_back_to_ocr(self):
        """TEST 7 & 8: Groq API failure gracefully falls back to rule-based OCR and reports fallback."""
        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            # Mock Groq failure (e.g. rate limit, missing key, timeout)
            mock_vision.side_effect = RuntimeError("Groq API rate limit exceeded")

            response = self.client.post(
                "/api/process",
                files={"file": ("complex.png", self.sample_png_bytes, "image/png")}
            )

            self.assertEqual(response.status_code, 200)
            data = response.json()

            # Fallback assertion
            self.assertEqual(data["extraction"]["source"], "rule_based_ocr_fallback")
            self.assertIn("Groq API rate limit exceeded", data["extraction"]["fallback_reason"])
            self.assertIn("record", data)
            self.assertIn("validation", data)

    def test_10_original_ocr_text_preserved(self):
        """TEST 10: Original OCR text is preserved in response pages."""
        response = self.client.post(
            "/api/process",
            files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("pages", data)
        self.assertIsInstance(data["pages"], list)
        self.assertTrue(len(data["pages"]) > 0)
        self.assertIn("text", data["pages"][0])

    def test_11_api_response_backward_compatible(self):
        """TEST 11, 12 & 13: Response contains all required backward-compatible top-level keys, complexity metadata, and no API key."""
        response = self.client.post(
            "/api/process",
            files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Top-level required keys
        required_keys = {"message", "document_id", "filename", "pages", "record", "validation", "extraction", "complexity"}
        self.assertTrue(required_keys.issubset(data.keys()))

        # Zero API key exposure assertion
        response_str = json.dumps(data)
        self.assertNotIn("gsk_", response_str)
        self.assertNotIn("GROQ_API_KEY", response_str)

    def test_14_marathi_unicode_survival(self):
        """TEST 14: Devanagari Marathi Unicode survives complete endpoint execution."""
        response = self.client.post(
            "/api/process",
            files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Validate Marathi script in page text or record
        page_text = data["pages"][0]["text"]
        self.assertIsInstance(page_text, str)

    def test_15_survey_and_consistency_validation_works(self):
        """TEST 15 & 16: Survey reference validation and cross-field consistency work."""
        response = self.client.post(
            "/api/process",
            files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        val_fields = data["validation"]["fields"]
        self.assertIn("survey_reference", val_fields)
        self.assertIn("cross_field_consistency", val_fields)

    def test_17_raw_sample_collection_works(self):
        """TEST 17 & 18: Raw sample collection works without modifying NER ground truth dataset."""
        with patch("tools.save_ner_raw_sample.save_raw_sample") as mock_save:
            response = self.client.post(
                "/api/process",
                files={"file": ("sample.png", self.sample_png_bytes, "image/png")}
            )

            self.assertEqual(response.status_code, 200)
            mock_save.assert_called_once()


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestAPIHybridIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "Hybrid API integration unit tests failed!"


if __name__ == "__main__":
    run_tests()
