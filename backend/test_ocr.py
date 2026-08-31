from app.services.ocr_service import extract_text


IMAGE_PATH = "uploads/processed/page_1_processed.png"


text = extract_text(
    IMAGE_PATH,
    language="eng"
)

print("\n========== OCR RESULT ==========\n")
print(text)
print("\n================================")