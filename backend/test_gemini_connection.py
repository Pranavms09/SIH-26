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

    print("\n[*] Testing live Gemini API connection...")
    try:
        # Create a temporary 1x1 white PNG image for testing
        import tempfile
        import base64
        
        # 1x1 white PNG byte string
        tiny_png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
        
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(tiny_png)
            tmp_path = tmp.name

        try:
            res = service.generate_gemini_completion(
                file_path=tmp_path,
                prompt="Respond with JSON: {\"status\": \"ok\"}",
                json_mode=True,
                max_tokens=20
            )
            print(f"[✓] SUCCESS: Gemini API connection verified! Response: {res.strip()}")
            return True
        finally:
            import os
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except Exception as e:
        safe_reason = _classify_gemini_error(str(e))
        print(f"[✗] ERROR: Gemini API call failed!")
        print(f"    Reason: {safe_reason}")
        print(f"    Raw Error: {str(e)[:150]}")
        return False


if __name__ == "__main__":
    success = check_gemini_connection()
    sys.exit(0 if success else 1)
