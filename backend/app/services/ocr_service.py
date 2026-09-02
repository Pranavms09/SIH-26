try:
    import pytesseract
except ImportError:
    pytesseract = None

from pathlib import Path


def extract_text(image_path: str, language: str = "eng") -> str:
    """
    Extract text from an image using Tesseract OCR.
    """
    if pytesseract is None:
        return "[OCR Warning: pytesseract is not installed]"

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    try:
        text = pytesseract.image_to_string(
            str(image_path),
            lang=language,
            config="--psm 6",
        )
        return text.strip()
    except Exception as err:
        return f"[OCR Exception: {str(err)}]"