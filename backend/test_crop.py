from app.services.document_processor import crop_record_region

IMAGE_PATH = "uploads/processed/0d3d4de5-2048-4310-bd58-12a40205cb14/page_1.png"
OUTPUT_PATH = "uploads/processed/page_1_record.png"


crop_record_region(
    IMAGE_PATH,
    OUTPUT_PATH
)

print("Record region cropped successfully!")
print(OUTPUT_PATH)