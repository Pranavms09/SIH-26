"""
Unit tests for Complex 7/12 Document Vision Extraction Service (backend/app/services/vision_extractor.py).

Verifies all 13 required test cases using mocking with zero external network calls.
"""

import os
import json
import hashlib
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
from PIL import Image

# TEST 1: Service import works
from app.services.vision_extractor import (
    extract_land_record_from_image,
    validate_image_file,
    clamp_confidence,
    normalize_field_dict,
    parse_vision_json_response,
    MAX_IMAGE_SIZE_BYTES,
)
from app.models.land_record import LandRecord, ExtractedField


class TestVisionExtractor(unittest.TestCase):
    def setUp(self):
        """Create a temporary small test image file."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_image_path = os.path.join(self.temp_dir.name, "test_712_sample.png")

        img = Image.new("RGB", (20, 20), color="white")
        img.save(self.test_image_path, format="PNG")


    def tearDown(self):
        self.temp_dir.cleanup()

    def test_01_service_import(self):
        """TEST 1: Service and helper functions import successfully."""
        self.assertIsNotNone(extract_land_record_from_image)
        self.assertIsNotNone(validate_image_file)
        self.assertIsNotNone(normalize_field_dict)
        self.assertIsNotNone(parse_vision_json_response)

    def test_02_missing_api_key_handled(self):
        """TEST 2: Missing API key handled correctly with RuntimeError."""
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}, clear=True):
            with self.assertRaises(RuntimeError) as ctx:
                extract_land_record_from_image(self.test_image_path)
            self.assertIn("not configured", str(ctx.exception))

    def test_03_missing_image_rejected(self):
        """TEST 3: Missing image file is rejected with FileNotFoundError."""
        non_existent = os.path.join(self.temp_dir.name, "non_existent_file.png")
        with self.assertRaises(FileNotFoundError):
            validate_image_file(non_existent)

    def test_04_unsupported_extension_rejected(self):
        """TEST 4: Unsupported extension rejected with ValueError."""
        invalid_file = os.path.join(self.temp_dir.name, "document.pdf")
        Path(invalid_file).write_text("fake pdf contents")

        with self.assertRaises(ValueError) as ctx:
            validate_image_file(invalid_file)
        self.assertIn("Unsupported image format", str(ctx.exception))

    def test_05_groq_call_mocked(self):
        """TEST 5: Groq vision completion call is properly mocked and constructed."""
        with patch("app.services.vision_extractor.get_groq_service") as mock_get_service:
            mock_groq = MagicMock()
            mock_groq.is_configured.return_value = True
            mock_groq.generate_vision_completion.return_value = json_dumps_valid_marathi()
            mock_get_service.return_value = mock_groq

            record = extract_land_record_from_image(self.test_image_path)

            mock_groq.generate_vision_completion.assert_called_once()
            call_kwargs = mock_groq.generate_vision_completion.call_args.kwargs
            self.assertEqual(call_kwargs["image_path"], self.test_image_path)
            self.assertTrue(call_kwargs["json_mode"])
            self.assertIsInstance(record, LandRecord)

    def test_06_valid_mocked_json_parsed(self):
        """TEST 6: Valid mocked JSON response parses correctly into LandRecord."""
        raw_json_str = json_dumps_valid_marathi()
        parsed = parse_vision_json_response(raw_json_str)

        self.assertEqual(parsed["district"]["value"], "बीड")
        self.assertEqual(parsed["taluka"]["value"], "अंबाजोगाई")
        self.assertEqual(parsed["village"]["value"], "अंबाजोगाई (रुरल)")
        self.assertEqual(parsed["survey_number"]["value"], "312/2")
        self.assertEqual(parsed["land_holding_type"]["value"], "भोगवटादार वर्ग-1")
        self.assertEqual(parsed["owner_name"]["value"], "विलासराव पाटील")
        self.assertEqual(parsed["area"]["value"], "0.24.00")

    def test_07_malformed_json_rejected(self):
        """TEST 7: Malformed non-JSON output is rejected with ValueError."""
        invalid_json = "This is not JSON data from LLM"
        with self.assertRaises(ValueError) as ctx:
            parse_vision_json_response(invalid_json)
        self.assertIn("Failed to parse Groq vision response as JSON", str(ctx.exception))

    def test_08_missing_required_field_handled(self):
        """TEST 8: Missing required field in JSON response is handled safely."""
        partial_json = json.dumps({
            "district": {"value": "बीड", "confidence": 0.9},
            "taluka": {"value": "अंबाजोगाई", "confidence": 0.9}
            # Missing remaining 5 fields
        })

        with patch("app.services.vision_extractor.get_groq_service") as mock_get_service:
            mock_groq = MagicMock()
            mock_groq.is_configured.return_value = True
            mock_groq.generate_vision_completion.return_value = partial_json
            mock_get_service.return_value = mock_groq

            record = extract_land_record_from_image(self.test_image_path)

            self.assertEqual(record.district.value, "बीड")
            self.assertEqual(record.taluka.value, "अंबाजोगाई")

            # Missing fields should default to value=None and confidence=0.0
            self.assertIsNone(record.village.value)
            self.assertEqual(record.village.confidence, 0.0)
            self.assertIsNone(record.owner_name.value)
            self.assertEqual(record.owner_name.confidence, 0.0)

    def test_09_invalid_confidence_handled(self):
        """TEST 9: Invalid confidence scores are clamped safely to range [0.0, 1.0]."""
        self.assertEqual(clamp_confidence(1.5), 1.0)
        self.assertEqual(clamp_confidence(-0.5), 0.0)
        self.assertEqual(clamp_confidence("invalid"), 0.0)
        self.assertEqual(clamp_confidence(0.85), 0.85)

        norm = normalize_field_dict({"value": "बीड", "confidence": 2.5})
        self.assertEqual(norm.confidence, 1.0)

    def test_10_marathi_unicode_retention(self):
        """TEST 10: Marathi UTF-8 Unicode characters survive unchanged."""
        marathi_str = "अंबाजोगाई (रुरल)"
        norm = normalize_field_dict({"value": marathi_str, "confidence": 0.9})
        self.assertEqual(norm.value, marathi_str)
        self.assertIn("अंबाजोगाई", norm.value)

    def test_11_no_marathi_translation(self):
        """TEST 11: The service does not translate Marathi values to English."""
        raw_json_str = json_dumps_valid_marathi()
        parsed = parse_vision_json_response(raw_json_str)

        # Check values are Marathi and NOT English translations
        self.assertEqual(parsed["district"]["value"], "बीड")
        self.assertNotEqual(parsed["district"]["value"], "Beed")

        self.assertEqual(parsed["taluka"]["value"], "अंबाजोगाई")
        self.assertNotEqual(parsed["taluka"]["value"], "Ambajogai")

        self.assertEqual(parsed["owner_name"]["value"], "विलासराव पाटील")
        self.assertNotEqual(parsed["owner_name"]["value"], "Vilasrao Patil")

    def test_12_output_matches_land_record_schema(self):
        """TEST 12: Output matches the expected LandRecord schema instance."""
        with patch("app.services.vision_extractor.get_groq_service") as mock_get_service:
            mock_groq = MagicMock()
            mock_groq.is_configured.return_value = True
            mock_groq.generate_vision_completion.return_value = json_dumps_valid_marathi()
            mock_get_service.return_value = mock_groq

            record = extract_land_record_from_image(self.test_image_path)

            self.assertIsInstance(record, LandRecord)
            self.assertIsInstance(record.district, ExtractedField)
            self.assertIsInstance(record.taluka, ExtractedField)
            self.assertIsInstance(record.village, ExtractedField)
            self.assertIsInstance(record.survey_number, ExtractedField)
            self.assertIsInstance(record.land_holding_type, ExtractedField)
            self.assertIsInstance(record.owner_name, ExtractedField)
            self.assertIsInstance(record.area, ExtractedField)

    def test_13_input_image_unmodified(self):
        """TEST 13: Input image is strictly unmodified during extraction."""
        # Calculate SHA256 hash before
        with open(self.test_image_path, "rb") as f:
            hash_before = hashlib.sha256(f.read()).hexdigest()

        with patch("app.services.vision_extractor.get_groq_service") as mock_get_service:
            mock_groq = MagicMock()
            mock_groq.is_configured.return_value = True
            mock_groq.generate_vision_completion.return_value = json_dumps_valid_marathi()
            mock_get_service.return_value = mock_groq

            _ = extract_land_record_from_image(self.test_image_path)

        # Calculate SHA256 hash after
        with open(self.test_image_path, "rb") as f:
            hash_after = hashlib.sha256(f.read()).hexdigest()

        self.assertEqual(hash_before, hash_after, "Input image file was modified!")


def json_dumps_valid_marathi() -> str:
    """Helper returning a standard valid Marathi 7/12 JSON string."""
    return json.dumps({
        "district": {"value": "बीड", "confidence": 0.95},
        "taluka": {"value": "अंबाजोगाई", "confidence": 0.95},
        "village": {"value": "अंबाजोगाई (रुरल)", "confidence": 0.95},
        "survey_number": {"value": "312/2", "confidence": 0.90},
        "land_holding_type": {"value": "भोगवटादार वर्ग-1", "confidence": 0.85},
        "owner_name": {"value": "विलासराव पाटील", "confidence": 0.90},
        "area": {"value": "0.24.00", "confidence": 0.85}
    })


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestVisionExtractor)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "Vision extractor unit tests failed!"


if __name__ == "__main__":
    run_tests()
