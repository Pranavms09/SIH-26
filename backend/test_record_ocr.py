from app.services.document_processor import preprocess_image
from app.services.ocr_service import extract_text


INPUT_IMAGE = "uploads/processed/page_1_record.png"

PROCESSED_IMAGE = "uploads/processed/page_1_record_processed.png"


# Preprocess the cropped record
preprocess_image(
    INPUT_IMAGE,
    PROCESSED_IMAGE
)

print("Record preprocessing completed!")


# OCR using Marathi + English
text = extract_text(
    PROCESSED_IMAGE,
    language="mar+eng"
)


print("\n========== LAND RECORD OCR ==========\n")
print(text)
print("\n=====================================\n")