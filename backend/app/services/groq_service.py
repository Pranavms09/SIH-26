"""
Groq API Service Layer for BhuLekha.

Provides isolated, secure access to Groq's Vision LLM capabilities for complex land-record extraction.
Designed to fail gracefully without disrupting existing OCR or rule-based processing pipelines.

Supported vision models (must accept image_url content blocks):
  - meta-llama/llama-4-scout-17b-16e-instruct  (recommended, fast)
  - meta-llama/llama-4-maverick-17b-128e-instruct
  - llama-3.2-11b-vision-preview
  - llama-3.2-90b-vision-preview

NOTE: qwen/qwen3.6-27b is a TEXT-ONLY model on Groq API; it does not accept
image_url messages and will return HTTP 400 json_validate_failed with failed_generation="".
"""

import base64
import os
from pathlib import Path
from typing import Dict, Any, Optional

from app.config import get_groq_api_key, get_groq_vision_model, is_groq_configured

# Supported image formats for base64 encoding in Groq Vision API
SUPPORTED_IMAGE_EXTENSIONS = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def encode_image(image_path: str) -> str:
    """
    Encodes a local image file as a base64 Data URL suitable for Groq Vision API requests.

    Args:
        image_path (str): Path to local image file.

    Returns:
        str: Data URL formatted string (e.g., 'data:image/png;base64,...').

    Raises:
        FileNotFoundError: If the image file does not exist.
        ValueError: If the file format is unsupported or file is empty.
    """
    path = Path(image_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_IMAGE_EXTENSIONS:
        supported_str = ", ".join(SUPPORTED_IMAGE_EXTENSIONS.keys())
        raise ValueError(
            f"Unsupported image format '{ext}'. Supported formats: {supported_str}"
        )

    file_size = path.stat().st_size
    if file_size == 0:
        raise ValueError(f"Image file is empty: {image_path}")

    mime_type = SUPPORTED_IMAGE_EXTENSIONS[ext]
    with open(path, "rb") as image_file:
        encoded_data = base64.b64encode(image_file.read()).decode("utf-8")

    return f"data:{mime_type};base64,{encoded_data}"


def _classify_groq_error(error_message: str) -> str:
    """
    Classify a Groq API error message into a safe diagnostic category.

    Never exposes API keys or sensitive payloads.

    Returns:
        str: Human-readable error category string.
    """
    msg_lower = error_message.lower()
    if "json_validate_failed" in msg_lower or "failed_generation" in msg_lower:
        return "json_validate_failed: model rejected JSON structured-output request"
    if "401" in error_message or "unauthorized" in msg_lower or "authentication" in msg_lower:
        return "authentication_error: invalid or expired API key"
    if "429" in error_message or "rate limit" in msg_lower:
        return "rate_limit_error: Groq API rate limit exceeded"
    if "timeout" in msg_lower or "timed out" in msg_lower:
        return "timeout_error: Groq API request timed out"
    if "400" in error_message:
        return "invalid_request_error: HTTP 400 — check model name and request format"
    if "503" in error_message or "unavailable" in msg_lower:
        return "service_unavailable: Groq API temporarily unavailable"
    return f"groq_api_error: {error_message[:120]}"


class GroqService:
    """
    Service abstraction for interacting with Groq's vision models.
    Isolation ensures non-destructive degradation when GROQ_API_KEY is not configured.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize GroqService instance.

        Args:
            api_key (Optional[str]): Explicit API key. Defaults to environment configuration.
            model (Optional[str]): Explicit vision model. Defaults to environment configuration.
        """
        self.api_key = api_key if api_key is not None else get_groq_api_key()
        self.model = model if model is not None else get_groq_vision_model()
        self._client = None

        if self.api_key:
            try:
                from groq import Groq
                self._client = Groq(api_key=self.api_key)
            except ImportError:
                # If groq SDK is not installed, client remains None
                self._client = None

    def is_configured(self) -> bool:
        """
        Check if GroqService is fully configured and client is initialized.

        Returns:
            bool: True if client is initialized with valid API key, False otherwise.
        """
        return bool(self.api_key and self._client is not None)

    def get_status(self) -> Dict[str, Any]:
        """
        Get detailed status of Groq configuration.

        Returns:
            Dict[str, Any]: Status dictionary containing configuration details.
        """
        sdk_available = False
        try:
            import groq
            sdk_available = True
        except ImportError:
            pass

        return {
            "configured": self.is_configured(),
            "api_key_present": bool(self.api_key),
            "sdk_installed": sdk_available,
            "model": self.model,
        }

    def generate_vision_completion(
        self,
        image_path: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_mode: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        """
        Send a vision completion request to Groq API containing a local image and text prompt.

        Strategy:
          1. Try with response_format=json_object if json_mode=True.
          2. If Groq returns HTTP 400 json_validate_failed (model does not support json_object
             for vision requests), retry once WITHOUT response_format — rely on prompt instruction
             to produce JSON, then let the caller parse it with parse_vision_json_response().

        Args:
            image_path (str): Local path to image file.
            prompt (str): User prompt text.
            system_prompt (Optional[str]): System instructions.
            json_mode (bool): Whether to request JSON structured response.
            temperature (float): Sampling temperature.
            max_tokens (int): Maximum completion tokens.

        Returns:
            str: Model completion response text.

        Raises:
            RuntimeError: If Groq API key is not configured or SDK is missing.
            FileNotFoundError: If image_path does not exist.
            ValueError: If image_path format is unsupported or prompt is empty.
        """
        if not self.is_configured():
            raise RuntimeError(
                "Groq API service is not configured. Please set GROQ_API_KEY environment variable."
            )

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        # Encode local image to base64 Data URL
        data_url = encode_image(image_path)

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        user_content = [
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {
                    "url": data_url
                }
            }
        ]
        messages.append({"role": "user", "content": user_content})

        kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            response = self._client.chat.completions.create(**kwargs)
            return response.choices[0].message.content

        except RuntimeError as e:
            err_str = str(e)
            # If json_object mode failed with a 400/json_validate_failed, retry without it.
            # This happens when the vision model does not support response_format={json_object}.
            if json_mode and ("json_validate_failed" in err_str or "400" in err_str):
                retry_kwargs = {k: v for k, v in kwargs.items() if k != "response_format"}
                try:
                    response = self._client.chat.completions.create(**retry_kwargs)
                    return response.choices[0].message.content
                except RuntimeError as retry_err:
                    category = _classify_groq_error(str(retry_err))
                    raise RuntimeError(
                        f"Groq Vision structured-output request failed. "
                        f"Model: {self.model}. Category: {category}."
                    ) from retry_err

            # For non-JSON-mode errors or non-400 errors, classify and re-raise
            category = _classify_groq_error(err_str)
            raise RuntimeError(
                f"Groq Vision request failed. Model: {self.model}. Category: {category}."
            ) from e


# ---------------------------------------------------------------------------
# Singleton management
# ---------------------------------------------------------------------------

# Module-level singleton. Use get_groq_service() for all access.
# reset_groq_service() must be called whenever config (API key / model) changes
# at runtime (e.g., after loading .env in tests or server restarts).
_default_groq_service: Optional[GroqService] = None


def get_groq_service() -> GroqService:
    """Get or create a singleton GroqService instance using current environment config."""
    global _default_groq_service
    if _default_groq_service is None:
        _default_groq_service = GroqService()
    return _default_groq_service


def reset_groq_service() -> None:
    """
    Reset the singleton so it will be re-created on the next call to get_groq_service().

    Call this after updating environment variables (e.g., in tests or after .env reload).
    """
    global _default_groq_service
    _default_groq_service = None
