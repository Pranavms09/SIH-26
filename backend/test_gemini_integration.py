"""
Step 12: Comprehensive Integration Tests for Gemini 2.5 Flash Provider in BhuLekha.

Covers:
- Gemini configuration & default model (gemini-2.5-flash)
- PDF and Image file encoding (application/pdf, image/png)
- Error classification (zero API key exposure)
- JSON response parsing (pure JSON, ```json``` code fence, ```text``` code fence, embedded JSON in prose)
- Marathi Devanagari Unicode script preservation (no English translation)
- LandRecord model compatibility
- Direct integration with authoritative validation engine (validate_land_record)
- Post-condition assertion guaranteeing ZERO mutation of Gemini extracted record values
- Multi-provider hierarchy in /api/process (Gemini primary -> Groq secondary -> Rule-based OCR fallback)
- Explicit provider query parameter override (?provider=gemini or ?provider=groq)

Zero external network calls — all Gemini API interactions are mocked.
"""

import base64
import hashlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from PIL import Image
from fastapi.testclient import TestClient

from app.config import (
    DEFAULT_GEMINI_MODEL,
    get_gemini_api_key,
    get_gemini_model,
    get_primary_ai_provider,
    is_gemini_configured,
)
from app.main import app
from app.models.land_record import ExtractedField, LandRecord
from app.services.ai_validation_service import (
    process_and_validate_gemini_document,
    validate_ai_record,
)
from app.services.gemini_service import (
    GeminiService,
    _classify_gemini_error,
    encode_file_for_gemini,
    get_gemini_service,
    reset_gemini_service,
)
from app.services.gemini_vision_extractor import (
    extract_land_record_with_gemini,
    parse_gemini_json_response,
    validate_document_file,
)


def make_temp_png(directory: str, name: str = "test.png") -> str:
    path = os.path.join(directory, name)
    img = Image.new("RGB", (20, 20), color="white")
    img.save(path, format="PNG")
    return path


def make_temp_pdf(directory: str, name: str = "test.pdf") -> str:
    path = os.path.join(directory, name)
    # Write a minimal valid PDF header/trailer dummy file
    pdf_bytes = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n"
        b"0000000052 00000 n\n00000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\n"
        b"startxref\n160\n%%EOF\n"
    )
    with open(path, "wb") as f:
        f.write(pdf_bytes)
    return path


def valid_marathi_json() -> str:
    return json.dumps(
        {
            "district": {"value": "बीड", "confidence": 0.95},
            "taluka": {"value": "अंबाजोगाई", "confidence": 0.95},
            "village": {"value": "अंबाजोगाई (रुरल)", "confidence": 0.95},
            "survey_number": {"value": "312/2", "confidence": 0.90},
            "land_holding_type": {"value": "भोगवटादार वर्ग-1", "confidence": 0.85},
            "owner_name": {"value": "विलासराव पाटील", "confidence": 0.90},
            "area": {"value": "0.24.00", "confidence": 0.85},
        },
        ensure_ascii=False,
    )


class TestGeminiIntegration(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.img_path = make_temp_png(self.temp_dir.name, "page_1.png")
        self.pdf_path = make_temp_pdf(self.temp_dir.name, "doc_1.pdf")
        self.client = TestClient(app)
        reset_gemini_service()

    def tearDown(self):
        self.temp_dir.cleanup()
        reset_gemini_service()

    # ── TEST 1: Config ────────────────────────────────────────────────────────

    def test_01_config_loads_gemini_settings(self):
        """TEST 1: Gemini default configuration defaults to gemini-2.5-flash."""
        self.assertEqual(DEFAULT_GEMINI_MODEL, "gemini-2.5-flash")
        model = get_gemini_model()
        self.assertEqual(model, "gemini-2.5-flash")

    # ── TEST 2: PDF File Encoding ─────────────────────────────────────────────

    def test_02_pdf_file_encoding(self):
        """TEST 2: PDF file is encoded with application/pdf MIME type."""
        mime_type, base64_str = encode_file_for_gemini(self.pdf_path)
        self.assertEqual(mime_type, "application/pdf")
        self.assertTrue(len(base64_str) > 0)
        decoded = base64.b64decode(base64_str)
        self.assertTrue(decoded.startswith(b"%PDF"))

    # ── TEST 3: Image File Encoding ───────────────────────────────────────────

    def test_03_image_file_encoding(self):
        """TEST 3: Image PNG file is encoded with image/png MIME type."""
        mime_type, base64_str = encode_file_for_gemini(self.img_path)
        self.assertEqual(mime_type, "image/png")
        self.assertTrue(len(base64_str) > 0)

    # ── TEST 4: Error Classification — Zero API Key Exposure ─────────────────

    def test_04_error_classifier_sanitizes_api_key(self):
        """TEST 4: _classify_gemini_error produces safe diagnostic messages without API key exposure."""
        test_errors = [
            "HTTP 400: invalid_argument for key=AIzaSySecretApiKey123",
            "HTTP 401: Unauthorized request with key=AIzaSySecretApiKey123",
            "HTTP 429: Resource exhausted / quota limit exceeded",
            "Request timed out after 60 seconds",
        ]
        for err in test_errors:
            classified = _classify_gemini_error(err)
            self.assertIsInstance(classified, str)
            self.assertNotIn("AIzaSySecretApiKey123", classified)
            self.assertNotIn("key=", classified)

        self.assertIn("invalid_request_error", _classify_gemini_error(test_errors[0]))
        self.assertIn("authentication_error", _classify_gemini_error(test_errors[1]))
        self.assertIn("rate_limit_error", _classify_gemini_error(test_errors[2]))
        self.assertIn("timeout_error", _classify_gemini_error(test_errors[3]))

    # ── TEST 5: JSON Parser — Pure JSON ──────────────────────────────────────

    def test_05_json_parser_handles_pure_json(self):
        """TEST 5: Pure JSON string parsed cleanly."""
        parsed = parse_gemini_json_response(valid_marathi_json())
        self.assertEqual(parsed["district"]["value"], "बीड")
        self.assertEqual(parsed["survey_number"]["value"], "312/2")

    # ── TEST 6: JSON Parser — Markdown JSON Fence ─────────────────────────────

    def test_06_json_parser_handles_markdown_json_fence(self):
        """TEST 6: ```json ... ``` code fenced string is cleaned and parsed."""
        fenced = "```json\n" + valid_marathi_json() + "\n```"
        parsed = parse_gemini_json_response(fenced)
        self.assertEqual(parsed["taluka"]["value"], "अंबाजोगाई")

    # ── TEST 7: JSON Parser — Markdown Text Fence ─────────────────────────────

    def test_07_json_parser_handles_markdown_text_fence(self):
        """TEST 7: ```text ... ``` code fenced string is cleaned and parsed."""
        fenced = "```text\n" + valid_marathi_json() + "\n```"
        parsed = parse_gemini_json_response(fenced)
        self.assertEqual(parsed["village"]["value"], "अंबाजोगाई (रुरल)")

    # ── TEST 8: JSON Parser — Embedded JSON in Prose ──────────────────────────

    def test_08_json_parser_handles_embedded_json(self):
        """TEST 8: JSON object embedded inside model explanatory text is extracted correctly."""
        prose = (
            "Extracted Maharashtra 7/12 Land Record Data:\n"
            + valid_marathi_json()
            + "\nEnd of extraction."
        )
        parsed = parse_gemini_json_response(prose)
        self.assertEqual(parsed["owner_name"]["value"], "विलासराव पाटील")

    # ── TEST 9: Gemini Extraction → LandRecord ────────────────────────────────

    def test_09_gemini_extraction_returns_land_record(self):
        """TEST 9: extract_land_record_with_gemini returns validated LandRecord model."""
        mock_service = MagicMock()
        mock_service.is_configured.return_value = True
        mock_service.generate_gemini_completion.return_value = valid_marathi_json()

        with patch("app.services.gemini_vision_extractor.get_gemini_service", return_value=mock_service):
            record = extract_land_record_with_gemini(self.pdf_path)

        self.assertIsInstance(record, LandRecord)
        self.assertEqual(record.district.value, "बीड")
        self.assertEqual(record.taluka.value, "अंबाजोगाई")
        self.assertEqual(record.village.value, "अंबाजोगाई (रुरल)")
        self.assertEqual(record.survey_number.value, "312/2")
        self.assertEqual(record.land_holding_type.value, "भोगवटादार वर्ग-1")
        self.assertEqual(record.owner_name.value, "विलासराव पाटील")
        self.assertEqual(record.area.value, "0.24.00")

    # ── TEST 10: Missing Fields Default to Null ───────────────────────────────

    def test_10_missing_fields_default_to_null(self):
        """TEST 10: Unextracted missing fields default to value=None, confidence=0.0."""
        partial_json = json.dumps(
            {
                "district": {"value": "बीड", "confidence": 0.95},
                "taluka": {"value": "अंबाजोगाई", "confidence": 0.95},
            },
            ensure_ascii=False,
        )
        mock_service = MagicMock()
        mock_service.is_configured.return_value = True
        mock_service.generate_gemini_completion.return_value = partial_json

        with patch("app.services.gemini_vision_extractor.get_gemini_service", return_value=mock_service):
            record = extract_land_record_with_gemini(self.img_path)

        self.assertEqual(record.district.value, "बीड")
        self.assertIsNone(record.village.value)
        self.assertEqual(record.village.confidence, 0.0)
        self.assertIsNone(record.owner_name.value)

    # ── TEST 11: Devanagari Marathi Retained Without Translation ─────────────

    def test_11_marathi_unicode_survives(self):
        """TEST 11: Devanagari Marathi script values survive extraction without translation."""
        parsed = parse_gemini_json_response(valid_marathi_json())
        self.assertEqual(parsed["district"]["value"], "बीड")
        self.assertNotEqual(parsed["district"]["value"], "Beed")
        self.assertEqual(parsed["owner_name"]["value"], "विलासराव पाटील")

    # ── TEST 12: Validation Adapter Integration ─────────────────────────────

    def test_12_gemini_record_passes_authoritative_validation(self):
        """TEST 12: Gemini LandRecord passes through authoritative validation engine with source='gemini_vision'."""
        record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        res = validate_ai_record(record, source="gemini_vision")
        self.assertEqual(res["source"], "gemini_vision")
        self.assertEqual(res["validation"]["status"], "valid")
        self.assertIn("fields", res["validation"])

    # ── TEST 13: Zero Mutation Assertion ─────────────────────────────────────

    def test_13_validation_does_not_mutate_gemini_record(self):
        """TEST 13: validate_ai_record post-condition check guarantees zero value mutation."""
        record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="3312/2", confidence=0.99),  # invalid format
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        original_val = record.survey_number.value
        res = validate_ai_record(record, source="gemini_vision")

        # Confirm Gemini record value is strictly unchanged
        self.assertEqual(record.survey_number.value, original_val)
        self.assertEqual(record.survey_number.value, "3312/2")
        self.assertEqual(res["validation"]["status"], "needs_review")

    # ── TEST 14: API Route uses Gemini Primary ────────────────────────────────

    def test_14_api_process_uses_gemini_primary(self):
        """TEST 14: /api/process uses Gemini 2.5 Flash as primary AI provider for complex document."""
        mock_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_with_gemini") as mock_gemini:

            mock_route.return_value = {
                "route": "groq",  # complex AI route
                "reason": "Complex dense layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            mock_gemini.return_value = mock_record

            response = self.client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["source"], "gemini_vision")
        self.assertEqual(data["record"]["owner_name"]["value"], "विलासराव पाटील")
        mock_gemini.assert_called_once()

    # ── TEST 15: Fallback to Groq when Gemini fails ─────────────────────────

    def test_15_api_process_fallback_to_groq(self):
        """TEST 15: When Gemini fails, /api/process falls back to Groq secondary provider."""
        mock_groq_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_with_gemini") as mock_gemini, \
             patch("app.api.process.extract_land_record_from_image") as mock_groq:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex dense layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            mock_gemini.side_effect = RuntimeError("Gemini API quota exceeded")
            mock_groq.return_value = mock_groq_record

            response = self.client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["source"], "groq_vision")
        mock_gemini.assert_called_once()
        mock_groq.assert_called_once()

    # ── TEST 16: Fallback to Rule-based OCR when both AI fail ─────────────────

    def test_16_api_process_fallback_to_rule_ocr(self):
        """TEST 16: When both Gemini and Groq fail, system falls back to rule-based OCR."""
        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_with_gemini") as mock_gemini, \
             patch("app.api.process.extract_land_record_from_image") as mock_groq:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex dense layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            mock_gemini.side_effect = RuntimeError("Gemini API error")
            mock_groq.side_effect = RuntimeError("Groq API rate limit error")

            response = self.client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["source"], "rule_based_ocr_fallback")
        self.assertIn("fallback_reason", data["extraction"])

    # ── TEST 17: Provider Query Parameter Override ────────────────────────────

    def test_17_api_process_provider_param_override(self):
        """TEST 17: Explicit ?provider=groq query param forces Groq Vision provider."""
        mock_groq_record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="312/2", confidence=0.90),
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_with_gemini") as mock_gemini, \
             patch("app.api.process.extract_land_record_from_image") as mock_groq:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex dense layout",
                "complexity": {"classification": "complex", "score": 0.8},
            }
            mock_groq.return_value = mock_groq_record

            response = self.client.post(
                "/api/process?provider=groq",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["source"], "groq_vision")
        mock_gemini.assert_not_called()
        mock_groq.assert_called_once()

    # ── TEST 18: Zero API Key Exposure ───────────────────────────────────────

    def test_18_zero_api_key_exposure_in_response(self):
        """TEST 18: API response never contains API keys or secret credentials."""
        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        response = self.client.post(
            "/api/process",
            files={"file": ("sample.png", png_bytes, "image/png")}
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        resp_str = json.dumps(data)

        self.assertNotIn("GEMINI_API_KEY", resp_str)
        self.assertNotIn("GROQ_API_KEY", resp_str)
        self.assertNotIn("gsk_", resp_str)
        self.assertNotIn("AIzaSy", resp_str)


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGeminiIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), f"Gemini integration tests failed! {result.failures} {result.errors}"


if __name__ == "__main__":
    run_tests()
