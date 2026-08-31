import re
from typing import Dict, Any
from app.models.land_record import LandRecord


def validate_area_consistency(record: LandRecord) -> Dict[str, Any]:
    """
    Validate land area consistency and structural sanity.
    Expected format: hectare.are.centiare (e.g. 0.24.00)
    """
    area_val = record.area.value
    if not area_val:
        return {
            "status": "missing",
            "message": "Area value is missing."
        }

    pattern = r"^\d+\.\d{2}\.\d{2}$"
    if not re.match(pattern, area_val):
        return {
            "status": "invalid",
            "message": "Area format is invalid for land record standards."
        }

    try:
        parts = area_val.split(".")
        hectares = int(parts[0])
        ares = int(parts[1])
        centiares = int(parts[2])

        # Ares and centiares in Maharashtra 7/12 land records are 0-99
        if ares >= 100 or centiares >= 100:
            return {
                "status": "suspicious",
                "message": "Area subunit values (ares/centiares) exceed standard bounds."
            }
    except Exception:
        return {
            "status": "invalid",
            "message": "Area structure could not be parsed."
        }

    return {
        "status": "valid",
        "message": "Area is consistent."
    }


def validate_owner_consistency(record: LandRecord) -> Dict[str, Any]:
    """
    Detect suspicious patterns in owner name field.
    """
    owner_val = record.owner_name.value
    if not owner_val:
        return {
            "status": "missing",
            "message": "Owner name is missing."
        }

    owner_str = str(owner_val).strip()

    # Check if owner name is purely digits
    if re.match(r"^\d+$", owner_str):
        return {
            "status": "suspicious",
            "message": "Owner name consists entirely of digits."
        }

    # Check for URLs
    if re.search(r"https?://|www\.", owner_str, re.IGNORECASE):
        return {
            "status": "suspicious",
            "message": "Owner name contains URL text."
        }

    # Check for misplaced record header/section field labels
    field_labels = [
        "जिल्हा",
        "तालुका",
        "गाव",
        "सर्वे",
        "भूमापन",
        "क्षेत्र",
        "हंगाम",
        "खाता"
    ]
    for label in field_labels:
        if label in owner_str:
            return {
                "status": "suspicious",
                "message": "Owner name contains text resembling another record field."
            }

    # Check for excessively long OCR text
    if len(owner_str) > 100:
        return {
            "status": "suspicious",
            "message": "Owner name text is excessively long."
        }

    return {
        "status": "valid",
        "message": "Owner name is consistent."
    }


def validate_survey_consistency(record: LandRecord) -> Dict[str, Any]:
    """
    Validate structural consistency of survey number field.
    """
    survey_val = record.survey_number.value
    if not survey_val:
        return {
            "status": "missing",
            "message": "Survey number is missing."
        }

    pattern = r"^\d+(?:/\d+)?$"
    if not re.match(pattern, str(survey_val).strip()):
        return {
            "status": "invalid",
            "message": "Survey number format is invalid."
        }

    return {
        "status": "valid",
        "message": "Survey number structure is consistent."
    }


def validate_record_consistency(record: LandRecord) -> Dict[str, Any]:
    """
    Perform cross-field consistency validation on the land record.
    """
    area_res = validate_area_consistency(record)
    owner_res = validate_owner_consistency(record)
    survey_res = validate_survey_consistency(record)

    checks = {
        "area": area_res,
        "owner": owner_res,
        "survey": survey_res
    }

    # Determine overall cross-field consistency status
    statuses = [c["status"] for c in checks.values()]

    if "invalid" in statuses:
        overall_status = "invalid"
    elif "suspicious" in statuses:
        overall_status = "suspicious"
    elif "missing" in statuses:
        overall_status = "missing"
    else:
        overall_status = "valid"

    return {
        "status": overall_status,
        "checks": checks
    }
