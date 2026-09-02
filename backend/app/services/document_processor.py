from pathlib import Path
try:
    import pymupdf
except ImportError:
    try:
        import fitz as pymupdf
    except ImportError:
        pymupdf = None

try:
    import cv2
except ImportError:
    cv2 = None


def pdf_to_images(pdf_path: str, output_dir: str):
    """
    Convert every page of a PDF into a PNG image.
    """
    if pymupdf is None:
        raise RuntimeError("PyMuPDF / fitz is not installed in the active Python environment. Run: pip install PyMuPDF")

    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    document = pymupdf.open(pdf_path)

    image_paths = []

    for page_number, page in enumerate(document):

        # Render page at higher resolution
        matrix = pymupdf.Matrix(2, 2)
        pixmap = page.get_pixmap(matrix=matrix)

        image_path = output_dir / f"page_{page_number + 1}.png"

        pixmap.save(str(image_path))

        image_paths.append(str(image_path))

    document.close()

    return image_paths


def preprocess_image(image_path: str, output_path: str):
    """
    Prepare document image for OCR.
    """
    if cv2 is None:
        raise RuntimeError("OpenCV (cv2) is not installed in the active environment. Run: pip install opencv-python-headless")

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Upscale the image
    enlarged = cv2.resize(
        gray,
        None,
        fx=2,
        fy=2,
        interpolation=cv2.INTER_CUBIC
    )

    # Reduce small noise
    denoised = cv2.fastNlMeansDenoising(
        enlarged,
        None,
        10,
        7,
        21
    )

    # Adaptive thresholding
    thresholded = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    cv2.imwrite(
        output_path,
        thresholded
    )

    return output_path

def crop_record_region(
    image_path: str,
    output_path: str
):
    """
    Crop the land-record region from the Mahabhulekh page.
    """

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    height, width = image.shape[:2]

    # Approximate region containing the actual
    # land record in the current Mahabhulekh sample.
    x1 = int(width * 0.02)
    y1 = int(height * 0.05)

    x2 = int(width * 0.98)
    y2 = int(height * 0.55)

    cropped = image[y1:y2, x1:x2]

    cv2.imwrite(
        output_path,
        cropped
    )

    return output_path

def crop_record_sections(
    image_path: str,
    output_dir: str
):
    """
    Split a 7/12 land record into logical sections.
    """

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    output_dir = Path(output_dir)
    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------
    # Header section
    # --------------------------------

    header = image[
        70:280,
        200:1450
    ]

    header_path = output_dir / "record_header.png"

    cv2.imwrite(
        str(header_path),
        header
    )


    # --------------------------------
    # Owner / Rights section
    # --------------------------------

    owner_rights = image[
        210:650,
        200:1450
    ]

    owner_path = output_dir / "owner_rights.png"

    cv2.imwrite(
        str(owner_path),
        owner_rights
    )


    # --------------------------------
    # Crop table section
    # --------------------------------

    crop_table = image[
        620:930,
        200:1450
    ]

    crop_path = output_dir / "crop_table.png"

    cv2.imwrite(
        str(crop_path),
        crop_table
    )


    return {
        "header": str(header_path),
        "owner_rights": str(owner_path),
        "crop_table": str(crop_path)
    }