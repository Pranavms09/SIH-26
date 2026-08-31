"""
Centralized Configuration Module for BhuLekha Backend.
Handles environment variables safely using dotenv, providing defaults and status checks.
"""

import os
from pathlib import Path

# Load .env file from backend directory or project root if present
try:
    from dotenv import load_dotenv
    # Look for .env in current file's parent structure or current working directory
    backend_dir = Path(__file__).resolve().parent.parent
    dotenv_path = backend_dir / ".env"
    if dotenv_path.exists():
        load_dotenv(dotenv_path=dotenv_path)
    else:
        # Fallback to general cwd search
        load_dotenv()
except ImportError:
    pass

# Default Groq Vision Model
DEFAULT_GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

# Default Gemini Vision Model
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

# Default Primary AI Provider ("gemini" or "groq")
DEFAULT_PRIMARY_AI_PROVIDER = "gemini"


def get_groq_api_key() -> str:
    """Retrieve GROQ_API_KEY from environment variables."""
    return os.getenv("GROQ_API_KEY", "").strip()


def get_groq_vision_model() -> str:
    """Retrieve GROQ_VISION_MODEL from environment variables, defaulting to a supported vision model."""
    model = os.getenv("GROQ_VISION_MODEL", "").strip()
    return model if model else DEFAULT_GROQ_VISION_MODEL


def is_groq_configured() -> bool:
    """
    Check whether Groq integration is fully configured with an API key.
    
    Returns:
        bool: True if GROQ_API_KEY is present and non-empty, False otherwise.
    """
    key = get_groq_api_key()
    return len(key) > 0 and key != "your_groq_api_key_here"


def get_gemini_api_key() -> str:
    """Retrieve GEMINI_API_KEY from environment variables."""
    return os.getenv("GEMINI_API_KEY", "").strip()


def get_gemini_model() -> str:
    """Retrieve GEMINI_MODEL from environment variables, defaulting to gemini-2.5-flash."""
    model = os.getenv("GEMINI_MODEL", "").strip()
    return model if model else DEFAULT_GEMINI_MODEL


def is_gemini_configured() -> bool:
    """
    Check whether Gemini integration is fully configured with an API key.

    Returns:
        bool: True if GEMINI_API_KEY is present and non-empty (and not default placeholder), False otherwise.
    """
    key = get_gemini_api_key()
    return len(key) > 0 and key != "your_gemini_api_key_here"


def get_primary_ai_provider() -> str:
    """
    Retrieve configured primary AI provider ('gemini' or 'groq').

    Returns:
        str: Configured provider name (lowercase), defaulting to 'gemini'.
    """
    provider = os.getenv("PRIMARY_AI_PROVIDER", "").strip().lower()
    if provider in ("gemini", "groq"):
        return provider
    return DEFAULT_PRIMARY_AI_PROVIDER
