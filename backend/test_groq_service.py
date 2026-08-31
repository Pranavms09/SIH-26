"""
Unit tests for Groq API Service Layer (backend/app/services/groq_service.py).

Tests all 7 required conditions without executing live API calls.
"""

import os
import base64
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path

# TEST 1: Service module can be imported
from app.services.groq_service import (
    GroqService,
    encode_image,
    get_groq_service,
    SUPPORTED_IMAGE_EXTENSIONS
)
from app.config import get_groq_api_key, get_groq_vision_model, is_groq_configured


class TestGroqService(unittest.TestCase):
    def setUp(self):
        """Create a temporary small test image for file encoding tests."""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.test_image_path = os.path.join(self.temp_dir.name, "test_sample.png")
        
        # Generate minimal 1x1 PNG image programmatically
        from PIL import Image
        img = Image.new('RGB', (10, 10), color='blue')
        img.save(self.test_image_path, format="PNG")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_01_importability(self):
        """TEST 1: Groq service can be imported successfully."""
        self.assertIsNotNone(GroqService)
        self.assertIsNotNone(encode_image)

    def test_02_missing_api_key_handling(self):
        """TEST 2: Missing GROQ_API_KEY is handled cleanly without crashing."""
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}, clear=True):
            service = GroqService(api_key="")
            self.assertFalse(service.is_configured())
            status = service.get_status()
            self.assertFalse(status["configured"])
            self.assertFalse(status["api_key_present"])

            # Attempting to send completion without API key should raise RuntimeError
            with self.assertRaises(RuntimeError) as ctx:
                service.generate_vision_completion(
                    image_path=self.test_image_path,
                    prompt="Extract land record details"
                )
            self.assertIn("not configured", str(ctx.exception))

    def test_03_configured_model_reading(self):
        """TEST 3: Configured model is read correctly from environment or defaults."""
        with patch.dict(os.environ, {"GROQ_VISION_MODEL": "custom/vision-model-v1"}, clear=True):
            service = GroqService(api_key="mock_key")
            self.assertEqual(service.model, "custom/vision-model-v1")

        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("GROQ_VISION_MODEL", None)
            service = GroqService(api_key="mock_key")
            self.assertEqual(service.model, "meta-llama/llama-4-scout-17b-16e-instruct")

    def test_04_nonexistent_image_path_rejected(self):
        """TEST 4: Nonexistent image path is rejected cleanly."""
        service = GroqService(api_key="mock_key")
        non_existent_path = os.path.join(self.temp_dir.name, "does_not_exist.png")
        
        with self.assertRaises(FileNotFoundError):
            encode_image(non_existent_path)

        # Invalid format extension test
        invalid_ext_path = os.path.join(self.temp_dir.name, "doc.pdf")
        Path(invalid_ext_path).write_text("fake pdf data")
        with self.assertRaises(ValueError) as ctx:
            encode_image(invalid_ext_path)
        self.assertIn("Unsupported image format", str(ctx.exception))

    def test_05_valid_local_test_image_encoded(self):
        """TEST 5: Valid local test image can be encoded successfully."""
        data_url = encode_image(self.test_image_path)
        self.assertIsInstance(data_url, str)
        self.assertTrue(len(data_url) > 0)

    def test_06_base64_format_and_prefix(self):
        """TEST 6: Base64 image data has expected prefix and valid base64 payload."""
        data_url = encode_image(self.test_image_path)
        self.assertTrue(data_url.startswith("data:image/png;base64,"))
        
        # Verify base64 string can be decoded
        header, base64_payload = data_url.split(",", 1)
        self.assertEqual(header, "data:image/png;base64")
        decoded_bytes = base64.b64decode(base64_payload)
        self.assertTrue(len(decoded_bytes) > 0)

    def test_07_mocked_api_call_no_network(self):
        """TEST 7: Service completion functions using mocks with zero network calls."""
        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_mock_key_12345"}):
            # Mock groq SDK
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content='{"survey_no": "123/A", "owner": "Ramesh Patil"}'))
            ]
            mock_client.chat.completions.create.return_value = mock_response

            service = GroqService(api_key="gsk_test_mock_key_12345")
            service._client = mock_client  # Inject mock client

            result = service.generate_vision_completion(
                image_path=self.test_image_path,
                prompt="Extract 7/12 details",
                json_mode=True
            )

            self.assertEqual(result, '{"survey_no": "123/A", "owner": "Ramesh Patil"}')
            mock_client.chat.completions.create.assert_called_once()
            
            # Inspect argument structure passed to groq SDK
            call_kwargs = mock_client.chat.completions.create.call_args.kwargs
            self.assertEqual(call_kwargs["model"], "meta-llama/llama-4-scout-17b-16e-instruct")
            self.assertEqual(call_kwargs["response_format"], {"type": "json_object"})
            
            # Check message structure
            messages = call_kwargs["messages"]
            self.assertEqual(messages[0]["role"], "user")
            self.assertEqual(messages[0]["content"][0]["type"], "text")
            self.assertEqual(messages[0]["content"][1]["type"], "image_url")
            self.assertTrue(messages[0]["content"][1]["image_url"]["url"].startswith("data:image/png;base64,"))


def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGroqService)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    assert result.wasSuccessful(), "Groq service unit tests failed!"


if __name__ == "__main__":
    run_tests()
