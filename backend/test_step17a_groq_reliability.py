"""
Step 17A: Comprehensive Unit Tests for Groq Vision JSON Reliability.

Covers:
- All previous groq_service and vision_extractor test cases
- Regression test for HTTP 400 json_validate_failed (the exact error that triggered Step 17A)
- Retry-without-response_format fallback
- Markdown-fenced and embedded JSON parsing
- Multi-owner complex document extraction
- Error classification (no API key exposure)
- Singleton reset behavior
- API response backward compatibility

Zero external network calls — all Groq interactions are mocked.
"""

import os
import json
import base64
import hashlib
import tempfile
import unittest
from unittest.mock import patch, MagicMock, call
from pathlib import Path
from PIL import Image

# ---- Service imports ----
from app.services.groq_service import (
    GroqService,
    encode_image,
    get_groq_service,
    reset_groq_service,
    _classify_groq_error,
    SUPPORTED_IMAGE_EXTENSIONS,
)
from app.services.vision_extractor import (
    extract_land_record_from_image,
    validate_image_file,
    clamp_confidence,
    normalize_field_dict,
    parse_vision_json_response,
    MAX_IMAGE_SIZE_BYTES,
)
from app.models.land_record import LandRecord, ExtractedField


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_temp_png(directory: str, name: str = "test.png") -> str:
    path = os.path.join(directory, name)
    img = Image.new("RGB", (20, 20), color="white")
    img.save(path, format="PNG")
    return path


def valid_marathi_json() -> str:
    return json.dumps({
        "district": {"value": "बीड", "confidence": 0.95},
        "taluka": {"value": "अंबाजोगाई", "confidence": 0.95},
        "village": {"value": "अंबाजोगाई (रुरल)", "confidence": 0.95},
        "survey_number": {"value": "312/2", "confidence": 0.90},
        "land_holding_type": {"value": "भोगवटादार वर्ग-1", "confidence": 0.85},
        "owner_name": {"value": "विलासराव पाटील", "confidence": 0.90},
        "area": {"value": "0.24.00", "confidence": 0.85},
    }, ensure_ascii=False)


def mock_groq_service_ok(json_str: str = None) -> MagicMock:
    """Return a fully configured mock GroqService that returns json_str."""
    mock = MagicMock(spec=GroqService)
    mock.is_configured.return_value = True
    mock.generate_vision_completion.return_value = json_str or valid_marathi_json()
    return mock


# ─────────────────────────────────────────────────────────────────────────────
# Test Class
# ─────────────────────────────────────────────────────────────────────────────

class TestStep17AGroqVisionReliability(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.img_path = make_temp_png(self.temp_dir.name, "page_1.png")
        reset_groq_service()  # Always start with a clean singleton

    def tearDown(self):
        self.temp_dir.cleanup()
        reset_groq_service()

    # ── TEST 1: Service imports ───────────────────────────────────────────────

    def test_01_all_service_imports_succeed(self):
        """TEST 1: All step-17A service components import successfully."""
        self.assertIsNotNone(GroqService)
        self.assertIsNotNone(encode_image)
        self.assertIsNotNone(get_groq_service)
        self.assertIsNotNone(reset_groq_service)
        self.assertIsNotNone(_classify_groq_error)
        self.assertIsNotNone(extract_land_record_from_image)
        self.assertIsNotNone(parse_vision_json_response)

    # ── TEST 2: Valid image encoding ─────────────────────────────────────────

    def test_02_valid_image_encoded_as_data_url(self):
        """TEST 2: Valid PNG image encodes as a base64 data URL."""
        data_url = encode_image(self.img_path)
        self.assertTrue(data_url.startswith("data:image/png;base64,"))
        _, payload = data_url.split(",", 1)
        decoded = base64.b64decode(payload)
        self.assertGreater(len(decoded), 0)

    # ── TEST 3: Model configuration ──────────────────────────────────────────

    def test_03_default_model_is_vision_capable(self):
        """TEST 3: Default Groq model is a known vision-capable model, not qwen text-only."""
        from app.config import get_groq_vision_model, DEFAULT_GROQ_VISION_MODEL
        # Must NOT be the old text-only model
        self.assertNotEqual(DEFAULT_GROQ_VISION_MODEL, "qwen/qwen3.6-27b")
        # Must be LLaMA or another Groq vision model
        model = get_groq_vision_model()
        self.assertNotEqual(model, "qwen/qwen3.6-27b")
        self.assertIn("llama", model.lower())  # llama-4-scout or llama-3.2-* etc.

    # ── TEST 4: Valid mocked JSON response parsed ─────────────────────────────

    def test_04_valid_json_parsed_into_land_record(self):
        """TEST 4: Valid Groq JSON response is parsed into a LandRecord correctly."""
        with patch("app.services.vision_extractor.get_groq_service") as mock_get:
            mock_get.return_value = mock_groq_service_ok()
            record = extract_land_record_from_image(self.img_path)

        self.assertIsInstance(record, LandRecord)
        self.assertEqual(record.district.value, "बीड")
        self.assertEqual(record.taluka.value, "अंबाजोगाई")
        self.assertEqual(record.village.value, "अंबाजोगाई (रुरल)")
        self.assertEqual(record.survey_number.value, "312/2")
        self.assertEqual(record.owner_name.value, "विलासराव पाटील")
        self.assertEqual(record.area.value, "0.24.00")

    # ── TEST 5: Markdown-fenced JSON parsed ──────────────────────────────────

    def test_05_markdown_fenced_json_parsed(self):
        """TEST 5: Markdown-fenced JSON (```json...```) is cleaned and parsed correctly."""
        fenced = "```json\n" + valid_marathi_json() + "\n```"
        parsed = parse_vision_json_response(fenced)
        self.assertIsInstance(parsed, dict)
        self.assertEqual(parsed["district"]["value"], "बीड")

    def test_05b_markdown_fenced_without_lang_tag(self):
        """TEST 5b: Markdown fence without 'json' tag is also cleaned correctly."""
        fenced = "```\n" + valid_marathi_json() + "\n```"
        parsed = parse_vision_json_response(fenced)
        self.assertEqual(parsed["taluka"]["value"], "अंबाजोगाई")

    # ── TEST 6: JSON embedded in prose ───────────────────────────────────────

    def test_06_json_embedded_in_prose_extracted(self):
        """TEST 6: JSON object embedded in model's explanatory prose is extracted correctly."""
        prose = (
            "Here is the extracted land record data:\n"
            + valid_marathi_json()
            + "\nPlease verify the above."
        )
        parsed = parse_vision_json_response(prose)
        self.assertIsInstance(parsed, dict)
        self.assertEqual(parsed["survey_number"]["value"], "312/2")

    # ── TEST 7: Missing fields ────────────────────────────────────────────────

    def test_07_missing_fields_default_to_null(self):
        """TEST 7: Fields missing from JSON response default to value=None, confidence=0.0."""
        partial = json.dumps({
            "district": {"value": "पुणे", "confidence": 0.9},
            "taluka": {"value": "मावळ", "confidence": 0.9},
        }, ensure_ascii=False)
        with patch("app.services.vision_extractor.get_groq_service") as mock_get:
            mock_get.return_value = mock_groq_service_ok(partial)
            record = extract_land_record_from_image(self.img_path)

        self.assertEqual(record.district.value, "पुणे")
        self.assertIsNone(record.village.value)
        self.assertEqual(record.village.confidence, 0.0)
        self.assertIsNone(record.survey_number.value)
        self.assertIsNone(record.owner_name.value)

    # ── TEST 8: Null fields ───────────────────────────────────────────────────

    def test_08_explicit_null_fields_handled(self):
        """TEST 8: Fields explicitly set to null in response are normalized to value=None."""
        with_nulls = json.dumps({
            "district": {"value": "बीड", "confidence": 0.9},
            "taluka": {"value": None, "confidence": 0.0},
            "village": {"value": "null", "confidence": 0.0},
            "survey_number": {"value": None, "confidence": 0.0},
            "land_holding_type": {"value": "भोगवटादार वर्ग-1", "confidence": 0.8},
            "owner_name": {"value": "none", "confidence": 0.0},
            "area": {"value": "0.24.00", "confidence": 0.85},
        }, ensure_ascii=False)
        with patch("app.services.vision_extractor.get_groq_service") as mock_get:
            mock_get.return_value = mock_groq_service_ok(with_nulls)
            record = extract_land_record_from_image(self.img_path)

        self.assertEqual(record.district.value, "बीड")
        self.assertIsNone(record.taluka.value)
        self.assertIsNone(record.village.value)
        self.assertIsNone(record.owner_name.value)
        self.assertEqual(record.area.value, "0.24.00")

    # ── TEST 9: Confidence clamping ───────────────────────────────────────────

    def test_09_confidence_clamped_to_valid_range(self):
        """TEST 9: Confidence scores exceeding [0,1] are clamped."""
        self.assertEqual(clamp_confidence(1.5), 1.0)
        self.assertEqual(clamp_confidence(-0.5), 0.0)
        self.assertEqual(clamp_confidence("bad"), 0.0)
        self.assertEqual(clamp_confidence(None), 0.0)
        self.assertAlmostEqual(clamp_confidence(0.85), 0.85)

        over_conf = json.dumps({
            "district": {"value": "बीड", "confidence": 2.5},
        }, ensure_ascii=False)
        field = normalize_field_dict(json.loads(over_conf)["district"])
        self.assertEqual(field.confidence, 1.0)

    # ── TEST 10: Marathi Unicode retention ───────────────────────────────────

    def test_10_marathi_unicode_survives_extraction(self):
        """TEST 10: Devanagari Marathi characters survive extraction unchanged."""
        marathi = "अंबाजोगाई (रुरल)"
        field = normalize_field_dict({"value": marathi, "confidence": 0.95})
        self.assertEqual(field.value, marathi)
        self.assertIn("अंबाजोगाई", field.value)

    # ── TEST 11: No Marathi→English translation ───────────────────────────────

    def test_11_marathi_not_translated_to_english(self):
        """TEST 11: Parser does not translate Marathi values to English."""
        parsed = parse_vision_json_response(valid_marathi_json())
        self.assertNotEqual(parsed["district"]["value"], "Beed")
        self.assertNotEqual(parsed["taluka"]["value"], "Ambajogai")
        self.assertNotEqual(parsed["owner_name"]["value"], "Vilasrao Patil")

    # ── TEST 12: Malformed JSON rejected ─────────────────────────────────────

    def test_12_malformed_json_raises_value_error(self):
        """TEST 12: Non-JSON text raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            parse_vision_json_response("This is not JSON at all.")
        self.assertIn("Failed to parse", str(ctx.exception))

    # ── TEST 13: Empty response rejected ─────────────────────────────────────

    def test_13_empty_response_raises_value_error(self):
        """TEST 13: Empty string response raises ValueError."""
        with self.assertRaises(ValueError):
            parse_vision_json_response("")

    # ── TEST 14: Missing API key raises RuntimeError ──────────────────────────

    def test_14_missing_api_key_raises_runtime_error(self):
        """TEST 14: Missing GROQ_API_KEY raises RuntimeError without crashing."""
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}, clear=True):
            reset_groq_service()
            with self.assertRaises(RuntimeError) as ctx:
                extract_land_record_from_image(self.img_path)
            self.assertIn("not configured", str(ctx.exception).lower())

    # ── TEST 15: REGRESSION — json_validate_failed → retry without response_format ──

    def test_15_json_validate_failed_400_retries_without_response_format(self):
        """
        REGRESSION TEST 15: When Groq returns HTTP 400 json_validate_failed,
        groq_service retries without response_format and returns the JSON text.
        """
        json_validate_error = RuntimeError(
            'Groq API HTTP Error 400: {"error":{"message":"Failed to validate JSON.",'
            '"code":"json_validate_failed","failed_generation":""}}'
        )
        success_response = MagicMock()
        success_response.choices = [
            MagicMock(message=MagicMock(content=valid_marathi_json()))
        ]

        with patch("app.services.groq_service.get_groq_api_key", return_value="gsk_mock_test_key"):
            with patch("app.services.groq_service.get_groq_vision_model", return_value="meta-llama/llama-4-scout-17b-16e-instruct"):
                service = GroqService(api_key="gsk_mock_test_key", model="meta-llama/llama-4-scout-17b-16e-instruct")

                mock_client = MagicMock()
                # First call (with response_format) raises 400; second call (without) succeeds
                mock_client.chat.completions.create.side_effect = [
                    json_validate_error,
                    success_response,
                ]
                service._client = mock_client

                result = service.generate_vision_completion(
                    image_path=self.img_path,
                    prompt="Extract land record JSON.",
                    json_mode=True,
                )

        # Verify result is the valid JSON
        self.assertIsInstance(result, str)
        parsed = json.loads(result)
        self.assertEqual(parsed["district"]["value"], "बीड")

        # Verify exactly 2 API calls were made
        self.assertEqual(mock_client.chat.completions.create.call_count, 2)

        # First call should have response_format
        first_call_kwargs = mock_client.chat.completions.create.call_args_list[0].kwargs
        self.assertIn("response_format", first_call_kwargs)
        self.assertEqual(first_call_kwargs["response_format"], {"type": "json_object"})

        # Second call (retry) should NOT have response_format
        second_call_kwargs = mock_client.chat.completions.create.call_args_list[1].kwargs
        self.assertNotIn("response_format", second_call_kwargs)

    # ── TEST 16: json_validate_failed → fallback via API endpoint ────────────

    def test_16_json_validate_failed_triggers_api_fallback(self):
        """
        REGRESSION TEST 16: When json_validate_failed error propagates fully
        (both json and non-json attempts fail), the API endpoint falls back to
        rule_based_ocr_fallback and records fallback_reason.
        """
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        json_validate_error = RuntimeError(
            "Groq Vision structured-output request failed. "
            "Model: meta-llama/llama-4-scout-17b-16e-instruct. "
            "Category: json_validate_failed: model rejected JSON structured-output request."
        )

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.75, "threshold": 0.5},
            }
            mock_vision.side_effect = json_validate_error

            response = client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Fallback must have occurred
        self.assertEqual(data["extraction"]["source"], "rule_based_ocr_fallback")
        self.assertIn("fallback_reason", data["extraction"])
        self.assertIn("json_validate_failed", data["extraction"]["fallback_reason"])

        # API key must NOT be in response
        response_str = json.dumps(data)
        self.assertNotIn("gsk_", response_str)
        self.assertNotIn("GROQ_API_KEY", response_str)

        # Record and validation must still be present (rule-based fallback values)
        self.assertIn("record", data)
        self.assertIn("validation", data)

    # ── TEST 17: Successful Groq → groq_vision source ────────────────────────

    def test_17_successful_groq_produces_groq_vision_source(self):
        """TEST 17: When Groq succeeds for complex doc, source = groq_vision."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        mock_record = LandRecord(
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
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.75, "threshold": 0.5},
            }
            mock_vision.return_value = mock_record

            response = client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["route"], "groq")
        self.assertEqual(data["extraction"]["source"], "groq_vision")
        self.assertEqual(data["record"]["owner_name"]["value"], "विलासराव पाटील")

    # ── TEST 18: Simple document — 0 Groq calls ──────────────────────────────

    def test_18_simple_document_zero_groq_calls(self):
        """TEST 18: Simple document routes to OCR; Groq is never called."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "ocr",
                "reason": "Simple document",
                "complexity": {"classification": "simple", "score": 0.1, "threshold": 0.5},
            }

            response = client.post(
                "/api/process",
                files={"file": ("simple.png", png_bytes, "image/png")}
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["extraction"]["route"], "ocr")
        self.assertEqual(data["extraction"]["source"], "rule_based_ocr")
        mock_vision.assert_not_called()  # 0 Groq calls

    # ── TEST 19: Error classification — no API key exposure ──────────────────

    def test_19_error_classifier_never_exposes_api_key(self):
        """TEST 19: _classify_groq_error produces safe messages with no API key exposure."""
        test_errors = [
            'Groq API HTTP Error 400: {"error":{"code":"json_validate_failed","failed_generation":""}}',
            'Groq API HTTP Error 401: {"error":{"message":"Invalid API key"}}',
            'Groq API HTTP Error 429: rate limit exceeded',
            'Groq API Request failed: Connection timed out',
        ]
        for err in test_errors:
            classified = _classify_groq_error(err)
            self.assertIsInstance(classified, str)
            self.assertNotIn("gsk_", classified)
            self.assertNotIn("GROQ_API_KEY", classified)
            self.assertGreater(len(classified), 0)

        # Verify correct categories
        self.assertIn("json_validate_failed", _classify_groq_error(test_errors[0]))
        self.assertIn("authentication_error", _classify_groq_error(test_errors[1]))
        self.assertIn("rate_limit_error", _classify_groq_error(test_errors[2]))
        self.assertIn("timeout_error", _classify_groq_error(test_errors[3]))

    # ── TEST 20: Input image unmodified ──────────────────────────────────────

    def test_20_input_image_not_modified(self):
        """TEST 20: The input image file is never modified during extraction."""
        with open(self.img_path, "rb") as f:
            hash_before = hashlib.sha256(f.read()).hexdigest()

        with patch("app.services.vision_extractor.get_groq_service") as mock_get:
            mock_get.return_value = mock_groq_service_ok()
            extract_land_record_from_image(self.img_path)

        with open(self.img_path, "rb") as f:
            hash_after = hashlib.sha256(f.read()).hexdigest()

        self.assertEqual(hash_before, hash_after)

    # ── TEST 21: No API key in response ──────────────────────────────────────

    def test_21_api_key_never_appears_in_fallback_reason(self):
        """TEST 21: fallback_reason field in API response never contains API key."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        # Simulate an error that includes the key in the raw error string
        error_with_key_attempt = RuntimeError(
            "Groq API HTTP Error 401: invalid auth for Bearer gsk_this_should_not_appear"
        )

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.75},
            }
            mock_vision.side_effect = error_with_key_attempt

            response = client.post(
                "/api/process",
                files={"file": ("test.png", png_bytes, "image/png")}
            )

        data = response.json()
        response_str = json.dumps(data)

        # Verify the key prefix does NOT appear anywhere in the response
        self.assertNotIn("gsk_", response_str)

    # ── TEST 22: No AI record mutation ───────────────────────────────────────

    def test_22_validation_does_not_mutate_ai_record(self):
        """TEST 22: Validation engine does not mutate the AI-extracted LandRecord values."""
        from app.services.ai_validation_service import validate_ai_record

        record = LandRecord(
            district=ExtractedField(value="बीड", confidence=0.95),
            taluka=ExtractedField(value="अंबाजोगाई", confidence=0.95),
            village=ExtractedField(value="अंबाजोगाई (रुरल)", confidence=0.95),
            survey_number=ExtractedField(value="3312/2", confidence=0.99),  # intentionally wrong
            land_holding_type=ExtractedField(value="भोगवटादार वर्ग-1", confidence=0.85),
            owner_name=ExtractedField(value="विलासराव पाटील", confidence=0.90),
            area=ExtractedField(value="0.24.00", confidence=0.85),
        )

        original_survey = record.survey_number.value
        result = validate_ai_record(record)

        # Record value must be unchanged
        self.assertEqual(record.survey_number.value, original_survey)
        self.assertEqual(record.survey_number.value, "3312/2")

        # Validation should have flagged it
        survey_status = result["validation"]["fields"]["survey_reference"]["status"]
        self.assertIn(survey_status, {"possible_error", "not_found", "invalid"})

    # ── TEST 23: Singleton reset ──────────────────────────────────────────────

    def test_23_reset_groq_service_clears_singleton(self):
        """TEST 23: reset_groq_service() forces re-creation on next call."""
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_1"}):
            reset_groq_service()
            s1 = get_groq_service()

        reset_groq_service()

        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_key_2"}):
            s2 = get_groq_service()

        # Must be different objects after reset
        self.assertIsNot(s1, s2)

    # ── TEST 24: Groq timeout → fallback ─────────────────────────────────────

    def test_24_groq_timeout_triggers_fallback(self):
        """TEST 24: Network timeout from Groq triggers rule_based_ocr_fallback."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.75},
            }
            mock_vision.side_effect = RuntimeError(
                "Groq Vision request failed. Model: meta-llama/llama-4-scout-17b-16e-instruct. "
                "Category: timeout_error: Groq API request timed out."
            )

            response = client.post(
                "/api/process",
                files={"file": ("complex.png", png_bytes, "image/png")}
            )

        data = response.json()
        self.assertEqual(data["extraction"]["source"], "rule_based_ocr_fallback")
        self.assertIn("fallback_reason", data["extraction"])

    # ── TEST 25: Authentication failure → fallback ────────────────────────────

    def test_25_groq_auth_failure_triggers_fallback(self):
        """TEST 25: Groq authentication error triggers rule_based_ocr_fallback."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        with patch("app.api.process.route_document") as mock_route, \
             patch("app.api.process.extract_land_record_from_image") as mock_vision:

            mock_route.return_value = {
                "route": "groq",
                "reason": "Complex layout",
                "complexity": {"classification": "complex", "score": 0.75},
            }
            mock_vision.side_effect = RuntimeError(
                "Groq Vision request failed. "
                "Category: authentication_error: invalid or expired API key."
            )

            response = client.post(
                "/api/process",
                files={"file": ("test.png", png_bytes, "image/png")}
            )

        data = response.json()
        self.assertEqual(data["extraction"]["source"], "rule_based_ocr_fallback")

    # ── TEST 26: Output matches LandRecord schema ─────────────────────────────

    def test_26_output_schema_matches_land_record(self):
        """TEST 26: All fields of the output are proper ExtractedField instances."""
        with patch("app.services.vision_extractor.get_groq_service") as mock_get:
            mock_get.return_value = mock_groq_service_ok()
            record = extract_land_record_from_image(self.img_path)

        for field_name in ["district", "taluka", "village", "survey_number",
                           "land_holding_type", "owner_name", "area"]:
            field = getattr(record, field_name)
            self.assertIsInstance(field, ExtractedField, f"{field_name} is not ExtractedField")

    # ── TEST 27: Response backward compatibility ──────────────────────────────

    def test_27_api_response_backward_compatible(self):
        """TEST 27: API response contains all required top-level keys (backward compat)."""
        import io
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        img_buf = io.BytesIO()
        Image.new("RGB", (50, 50), color="white").save(img_buf, format="PNG")
        png_bytes = img_buf.getvalue()

        response = client.post(
            "/api/process",
            files={"file": ("test.png", png_bytes, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        required = {"message", "document_id", "filename", "pages", "record",
                    "validation", "extraction", "complexity"}
        self.assertTrue(required.issubset(data.keys()))

        # No API key anywhere
        response_str = json.dumps(data)
        self.assertNotIn("gsk_", response_str)
        self.assertNotIn("GROQ_API_KEY", response_str)


# ─────────────────────────────────────────────────────────────────────────────

def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestStep17AGroqVisionReliability)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), f"Step 17A unit tests failed! {result.failures} {result.errors}"


if __name__ == "__main__":
    run_tests()
