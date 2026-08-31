from app.services.document_processor import crop_record_sections


IMAGE_PATH = (
    "uploads/processed/page_1_record.png"
)

OUTPUT_DIR = (
    "uploads/processed/sections"
)


sections = crop_record_sections(
    IMAGE_PATH,
    OUTPUT_DIR
)


print("\nSections created successfully!\n")

for name, path in sections.items():
    print(f"{name}: {path}")