from pathlib import Path

from app.services.document_processor import preprocess_image
from app.services.ocr_service import extract_text


SECTIONS = {
    "HEADER": "uploads/processed/sections/record_header.png",
    "OWNER_RIGHTS": "uploads/processed/sections/owner_rights.png",
    "CROP_TABLE": "uploads/processed/sections/crop_table.png"
}


OUTPUT_DIR = Path(
    "uploads/processed/sections/ocr"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


for section_name, image_path in SECTIONS.items():

    print(f"\nProcessing: {section_name}")

    input_path = Path(image_path)

    processed_path = (
        OUTPUT_DIR
        / f"{section_name.lower()}_processed.png"
    )

    # Preprocess
    preprocess_image(
        str(input_path),
        str(processed_path)
    )

    # OCR
    text = extract_text(
        str(processed_path),
        language="mar+eng"
    )

    print(
        f"\n========== {section_name} OCR ==========\n"
    )

    print(text)

    print(
        "\n========================================\n"
    )