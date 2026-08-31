from app.services.document_processor import pdf_to_images, preprocess_image


PDF_PATH = "uploads/Receipt_NL-SIL3WZWX.pdf"

OUTPUT_DIR = "uploads/processed"


# Convert PDF pages to images
images = pdf_to_images(
    PDF_PATH,
    OUTPUT_DIR
)

print("PDF converted successfully!")
print(images)


# Preprocess each page
for image in images:

    output_path = image.replace(
        ".png",
        "_processed.png"
    )

    preprocess_image(
        image,
        output_path
    )

    print("Processed:", output_path)