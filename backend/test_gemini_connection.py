"""
Gemini API Diagnostic Tool for Doc2Digital (test_gemini_connection.py).

Verifies GEMINI_API_KEY status and tests connection to Gemini 2.5 Flash (gemini-2.5-flash).
Never prints or exposes the actual API key.
"""

import sys
from app.config import get_gemini_api_key, get_gemini_model, is_gemini_configured
from app.services.gemini_service import get_gemini_service, _classify_gemini_error


def check_gemini_connection():
    print("=" * 60)
    print("Doc2Digital — Gemini API Configuration Diagnostic")
    print("=" * 60)

    key_present = is_gemini_configured()
    model = get_gemini_model()

    print(f"[*] GEMINI_API_KEY status: {'[CONFIGURED]' if key_present else '[MISSING / UNSET]'}")
    print(f"[*] GEMINI_MODEL: {model}")

    if not key_present:
        print("\n[!] WARNING: GEMINI_API_KEY is not configured in backend/.env")
        print("    Please set GEMINI_API_KEY=your_key in backend/.env to enable Gemini 2.5 Flash.")
        return False

    print("\n[*] Initializing Gemini Service...")
    service = get_gemini_service()
    status = service.get_status()
    print(f"[*] Service status: {status}")

    return True


if __name__ == "__main__":
    success = check_gemini_connection()
    sys.exit(0 if success else 1)
