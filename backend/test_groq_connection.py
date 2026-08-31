"""
Optional Live Connectivity Test for Groq API Integration.

Checks real Groq API connectivity ONLY if GROQ_API_KEY is present in environment.
If key is missing, skips cleanly without error.
NEVER logs or exposes secret API keys.
"""

import sys
import os
import tempfile
from pathlib import Path

# Add backend directory to sys.path if running directly
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import get_groq_api_key, get_groq_vision_model, is_groq_configured
from app.services.groq_service import GroqService


def test_connection():
    print("\n=======================================================")
    print("        BHULEKHA GROQ CONNECTIVITY TEST                ")
    print("=======================================================\n")

    if not is_groq_configured():
        print("GROQ_API_KEY not configured; skipping live Groq test.")
        print("To run live test, set GROQ_API_KEY in your .env or environment.")
        return 0

    model_name = get_groq_vision_model()
    print(f"-> GROQ_API_KEY detected.")
    print(f"-> Target Vision Model: {model_name}")
    print("-> Attempting minimal live vision API request...")

    # Generate a temporary 10x10 RGB test image
    with tempfile.TemporaryDirectory() as temp_dir:
        test_img_path = os.path.join(temp_dir, "test_dot.png")
        from PIL import Image
        img = Image.new('RGB', (10, 10), color='green')
        img.save(test_img_path, format="PNG")

        try:
            service = GroqService()
            response = service.generate_vision_completion(
                image_path=test_img_path,
                prompt="What color is this image? Reply with a single word.",
                max_tokens=20,
                temperature=0.0
            )

            print("\n[SUCCESS] Groq API response received successfully!")
            print(f"Response: {response.strip()}")
            print("✓ Live Groq connectivity verified.\n")
            return 0

        except Exception as e:
            print(f"\n[ERROR] Live Groq API test failed: {e}")
            print("Please check your API key, network connection, or vision model name.")
            return 1


if __name__ == "__main__":
    sys.exit(test_connection())
