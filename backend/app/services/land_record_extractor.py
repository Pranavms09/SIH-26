import re

from app.models.land_record import (
    LandRecord,
    ExtractedField
)


def clean_value(value):

    if value is None:
        return None

    value = value.strip()

    # Remove common OCR separators
    value = value.strip(" :-|")

    # Normalize spaces
    value = " ".join(value.split())

    return value


def extract_first(patterns, text):

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            return clean_value(
                match.group(1)
            )

    return None


def make_field(value, confidence):

    return ExtractedField(
        value=value,
        confidence=confidence
    )


def extract_land_record(
    header_text,
    owner_text,
    crop_text
):

    # --------------------------------
    # District
    # --------------------------------

    district = extract_first(
        [
            r"जिल्हा\s*[:\-]?\s*([^\n]+)"
        ],
        header_text
    )


    # --------------------------------
    # Taluka
    # --------------------------------

    taluka = extract_first(
        [
            r"तालुका\s*[:\-]?\s*([^\n]+)"
        ],
        header_text
    )


    # --------------------------------
    # Village
    # --------------------------------

    village = extract_first(
        [
            r"गाव\s*[:\-]?\s*([^\n]+)"
        ],
        header_text
    )


    # --------------------------------
    # Survey number
    # --------------------------------

    survey_number = extract_first(
        [
            r"भूमापन क्रमांक व उपविभाग\s*[:\-]?\s*([0-9\/]+)",
            r"भूमापन क्रमांक.*?([0-9]+\/[0-9]+)"
        ],
        header_text
    )


    # --------------------------------
    # Land holding type
    # --------------------------------

    land_holding_type = extract_first(
        [
            r"भू-धारणापध्दती\s*[:\-]?\s*([^\n]+)",
            r"भू-धारणा पध्दती\s*[:\-]?\s*([^\n]+)"
        ],
        header_text
    )


    # --------------------------------
    # Owner
    # --------------------------------

    owner_name = None

    owner_match = re.search(
        r"(?:विलासराव|विठ्ठलराव)[^\n]+",
        owner_text
    )

    if owner_match:

        owner_name = clean_value(
            owner_match.group(0)
        )


    # --------------------------------
    # Area
    # --------------------------------

    area = None

    area_match = re.search(
        r"\b\d+\.\d{2}\.\d{2}\b",
        owner_text
    )

    if area_match:

        area = area_match.group(0)


    # --------------------------------
    # Create structured record
    # --------------------------------

    return LandRecord(

        district=make_field(
            district,
            0.95 if district else 0.0
        ),

        taluka=make_field(
            taluka,
            0.95 if taluka else 0.0
        ),

        village=make_field(
            village,
            0.95 if village else 0.0
        ),

        survey_number=make_field(
            survey_number,
            0.90 if survey_number else 0.0
        ),

        land_holding_type=make_field(
            land_holding_type,
            0.85 if land_holding_type else 0.0
        ),

        owner_name=make_field(
            owner_name,
            0.75 if owner_name else 0.0
        ),

        area=make_field(
            area,
            0.80 if area else 0.0
        )
    )