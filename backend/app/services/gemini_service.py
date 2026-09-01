"""
Gemini 2.5 Flash API Service Layer for Doc2Digital.

Provides isolated, secure access to Google Gemini 2.5 Flash LLM capabilities for complex land-record extraction.
Supports PDF documents directly (application/pdf) as well as page images (image/png, image/jpeg, image/webp).
Designed to fail gracefully without disrupting existing OCR or rule-based processing pipelines.

Configured model: gemini-2.5-flash
"""

import base64
import json
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from app.config import (
    get_gemini_api_key,
    get_gemini_model,
    is_gemini_configured,
)

# Supported document & image extensions for Gemini API
SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def encode_file_for_gemini(file_path: str) -> Tuple[str, str]:
    """
    Encode a local file (PDF or image) as base64 string with its MIME type.

    Args:
        file_path (str): Path to local file.

    Returns:
        Tuple[str, str]: (mime_type, base64_encoded_string)

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If format is unsupported or file is empty.
    """
    path = Path(file_path)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Document file not found: {file_path}")

    ext = path.suffix.lower()
    if ext not in SUPPORTED_DOCUMENT_EXTENSIONS:
        supported_str = ", ".join(SUPPORTED_DOCUMENT_EXTENSIONS.keys())
        raise ValueError(
            f"Unsupported document format '{ext}'. Supported formats: {supported_str}"
        )

    file_size = path.stat().st_size
    if file_size == 0:
        raise ValueError(f"Document file is empty: {file_path}")

    mime_type = SUPPORTED_DOCUMENT_EXTENSIONS[ext]
    with open(path, "rb") as f:
        encoded_data = base64.b64encode(f.read()).decode("utf-8")

    return mime_type, encoded_data


def _classify_gemini_error(error_message: str) -> str:
    """
    Classify a Gemini API error message into a safe diagnostic category.
    Never exposes API keys or sensitive payloads.

    Args:
        error_message (str): Raw error string.

    Returns:
        str: Human-readable safe diagnostic message.
    """
    msg_lower = error_message.lower()
    # Strip any potential API key tokens from error message
    clean_msg = error_message
    if "key=" in clean_msg:
        import re
        clean_msg = re.sub(r"key=[A-Za-z0-9_\-]+", "key=[REDACTED]", clean_msg)

    if "401" in clean_msg or "unauthorized" in msg_lower or "api_key_invalid" in msg_lower or "invalid api key" in msg_lower:
        return "authentication_error: invalid or expired Gemini API key"
    if "429" in clean_msg or "resource_exhausted" in msg_lower or "rate limit" in msg_lower or "quota" in msg_lower:
        return "rate_limit_error: Gemini API rate limit or quota exceeded"
    if "timeout" in msg_lower or "timed out" in msg_lower:
        return "timeout_error: Gemini API request timed out"
    if "400" in clean_msg or "invalid_argument" in msg_lower:
        return "invalid_request_error: HTTP 400 — check model name and request format"
    if "503" in clean_msg or "unavailable" in msg_lower:
        return "service_unavailable: Gemini API temporarily unavailable"

    return f"gemini_api_error: {clean_msg[:120]}"


class GeminiService:
    """
    Service abstraction for interacting with Google's Gemini 2.5 Flash model.
    Isolation ensures non-destructive degradation when GEMINI_API_KEY is not configured.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize GeminiService instance.

        Args:
            api_key (Optional[str]): Explicit API key. Defaults to environment configuration.
            model (Optional[str]): Explicit model name. Defaults to environment configuration.
        """
        self.api_key = api_key if api_key is not None else get_gemini_api_key()
        self.model = model if model is not None else get_gemini_model()
        self._genai_client = None

        # Check if SDK is available
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self._genai_client = genai.Client(api_key=self.api_key)
            except (ImportError, Exception):
                self._genai_client = None

    def is_configured(self) -> bool:
        """
        Check if GeminiService is fully configured with an API key.

        Returns:
            bool: True if valid API key is present, False otherwise.
        """
        return bool(self.api_key and self.api_key != "your_gemini_api_key_here")

    def get_status(self) -> Dict[str, Any]:
        """
        Get detailed status of Gemini configuration.

        Returns:
            Dict[str, Any]: Configuration status dictionary.
        """
        sdk_available = False
        try:
            from google import genai
            sdk_available = True
        except ImportError:
            try:
                import google.generativeai
                sdk_available = True
            except ImportError:
                pass

        return {
            "configured": self.is_configured(),
            "api_key_present": bool(self.api_key and self.api_key != "your_gemini_api_key_here"),
            "sdk_installed": sdk_available,
            "model": self.model,
        }

    def generate_gemini_completion(
        self,
        file_path: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_mode: bool = True,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> str:
        """
        Send a completion request to Gemini 2.5 Flash containing a local PDF/image file and prompt.

        Args:
            file_path (str): Path to local document file (.pdf, .png, .jpg, .jpeg, .webp).
            prompt (str): Main extraction prompt.
            system_prompt (Optional[str]): Optional system prompt/instructions.
            json_mode (bool): Request JSON output format (default True).
            temperature (float): Model sampling temperature (default 0.1).
            max_tokens (int): Max token limit (default 2048).

        Returns:
            str: Raw completion text from Gemini.

        Raises:
            RuntimeError: If Gemini API key is missing or request fails.
            FileNotFoundError: If file_path does not exist.
            ValueError: If file format is unsupported or prompt is empty.
        """
        if not self.is_configured():
            raise RuntimeError(
                "Gemini API service is not configured. Please set GEMINI_API_KEY environment variable."
            )

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        mime_type, base64_data = encode_file_for_gemini(file_path)
        file_size_kb = Path(file_path).stat().st_size / 1024.0

        # Build combined prompt text
        full_text_prompt = prompt
        if system_prompt:
            full_text_prompt = f"{system_prompt}\n\n{prompt}"

        print(f"[Gemini API] Request sent to model '{self.model}' | MIME: {mime_type} | File: {file_path} ({file_size_kb:.1f} KB)")

        # Strategy 1: Try official SDK if client is initialized
        if self._genai_client is not None:
            try:
                from google.genai import types
                
                parts = [
                    types.Part.from_bytes(
                        data=base64.b64decode(base64_data),
                        mime_type=mime_type,
                    ),
                    types.Part.from_text(text=full_text_prompt),
                ]
                
                config = types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
                if json_mode:
                    config.response_mime_type = "application/json"

                response = self._genai_client.models.generate_content(
                    model=self.model,
                    contents=parts,
                    config=config,
                )
                if response and response.text:
                    print(f"[Gemini API] SDK response received ({len(response.text)} chars)")
                    return response.text
            except Exception as sdk_err:
                print(f"[Gemini API] SDK call attempt error: {sdk_err}. Trying HTTP REST fallback...")
                pass

        # Strategy 2: Direct REST API call via urllib.request (bulletproof stdlib implementation)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": full_text_prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data,
                            }
                        },
                    ],
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }

        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp_bytes = resp.read()
                res_json = json.loads(resp_bytes.decode("utf-8"))
                
                # Extract text output from Gemini REST payload structure
                candidates = res_json.get("candidates", [])
                if not candidates:
                    raise RuntimeError("Gemini API returned an empty candidate list.")
                
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise RuntimeError("Gemini API returned no content parts.")
                
                text_content = parts[0].get("text", "")
                return text_content

        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            cat = _classify_gemini_error(f"HTTP {e.code}: {err_body}")
            raise RuntimeError(f"Gemini API request failed. Model: {self.model}. Category: {cat}") from e
        except Exception as e:
            cat = _classify_gemini_error(str(e))
            raise RuntimeError(f"Gemini API request failed. Model: {self.model}. Category: {cat}") from e


# ---------------------------------------------------------------------------
# Singleton management
# ---------------------------------------------------------------------------

_default_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create a singleton GeminiService instance using current environment config."""
    global _default_gemini_service
    if _default_gemini_service is None:
        _default_gemini_service = GeminiService()
    return _default_gemini_service


def reset_gemini_service() -> None:
    """
    Reset the singleton so it will be re-created on the next call to get_gemini_service().
    Call this after updating environment variables.
    """
    global _default_gemini_service
    _default_gemini_service = None
