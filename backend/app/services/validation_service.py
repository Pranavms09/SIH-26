import re

from app.models.land_record import LandRecord

from app.services.reference_service import (
    validate_location_hierarchy,
    validate_survey_reference
)

from app.services.consistency_service import (
    validate_record_consistency
)

REVIEW_THRESHOLD = 0.80


def validate_survey_number(value):

    if not value:
        return {
            "status": "missing",
            "message": "Survey number was not extracted."
        }

    pattern = r"^\d+(?:/\d+)?$"

    if re.match(pattern, value):
        return {
            "status": "valid",
            "message": "Survey number format is valid."
        }

    return {
        "status": "invalid",
        "message": "Survey number format is invalid."
    }


def validate_area(value):

    if not value:
        return {
            "status": "missing",
            "message": "Area was not extracted."
        }

    # Maharashtra land-record style:
    # hectare.are.centiare
    pattern = r"^\d+\.\d{2}\.\d{2}$"

    if re.match(pattern, value):
        return {
            "status": "valid",
            "message": "Area format is valid."
        }

    return {
        "status": "review",
        "message": "Area format needs verification."
    }


def validate_required_field(name, field):

    if not field.value:
        return {
            "status": "missing",
            "message": f"{name} was not extracted."
        }

    if field.confidence < REVIEW_THRESHOLD:
        return {
            "status": "review",
            "message": (
                f"{name} has low confidence."
            )
        }

    return {
        "status": "valid",
        "message": f"{name} passed basic validation."
    }


def validate_land_record(record: LandRecord):

    validation = {}

    validation["district"] = validate_required_field(
        "District",
        record.district
    )

    validation["taluka"] = validate_required_field(
        "Taluka",
        record.taluka
    )

    validation["village"] = validate_required_field(
        "Village",
        record.village
    )

    validation["survey_number"] = validate_survey_number(
        record.survey_number.value
    )

    validation["owner_name"] = validate_required_field(
        "Owner name",
        record.owner_name
    )

    validation["area"] = validate_area(
        record.area.value
    )

    validation["location_hierarchy"] = (
        validate_location_hierarchy(
            district=record.district.value,
            taluka=record.taluka.value,
            village=record.village.value
        )
    )

    validation["survey_reference"] = (
        validate_survey_reference(
            district=record.district.value,
            taluka=record.taluka.value,
            village=record.village.value,
            survey_number=record.survey_number.value
        )
    )

    validation["cross_field_consistency"] = (
        validate_record_consistency(record)
    )

    # Overall status

    needs_review = any(
        item["status"] in {
            "review",
            "invalid",
            "missing",
            "possible_error",
            "suspicious"
        }
        for item in validation.values()
    )

    overall_status = (
        "needs_review"
        if needs_review
        else "valid"
    )

    return {
        "status": overall_status,
        "fields": validation
    }