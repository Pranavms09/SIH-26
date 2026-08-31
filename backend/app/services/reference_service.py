import json
from pathlib import Path


REFERENCE_FILE = Path(
    "data/reference_locations.json"
)

SURVEY_REFERENCE_FILE = Path(
    "data/reference_surveys.json"
)

from app.services.fuzzy_matcher import find_best_match


def load_locations():

    with open(
        REFERENCE_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def load_surveys():

    with open(
        SURVEY_REFERENCE_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def normalize_location(value):

    if not value:
        return ""

    value = value.strip()

    value = value.strip(" :-|")

    # Remove numeric location codes such as (560022)
    import re

    value = re.sub(
        r"\s*\(\d+\)\s*$",
        "",
        value
    )

    return " ".join(value.split())


def validate_location_hierarchy(
    district,
    taluka,
    village
):

    locations = load_locations()

    district_value = normalize_location(
        district
    )

    taluka_value = normalize_location(
        taluka
    )

    village_value = normalize_location(
        village
    )


    # District check
    if district_value not in locations:

        return {
            "status": "invalid",
            "message": (
                f"District '{district}' "
                "was not found."
            )
        }


    # Taluka check
    district_data = locations[
        district_value
    ]

    if taluka_value not in district_data:

        return {
            "status": "invalid",
            "message": (
                f"Taluka '{taluka}' "
                f"does not belong to "
                f"district '{district}'."
            )
        }


    # Village check
    villages = district_data[
        taluka_value
    ]

    if village_value not in [
        normalize_location(v)
        for v in villages
    ]:

        return {
            "status": "invalid",
            "message": (
                f"Village '{village}' "
                f"does not belong to "
                f"taluka '{taluka}'."
            )
        }


    return {
        "status": "valid",
        "message": (
            "District, taluka and village "
            "hierarchy is valid."
        )
    }


def validate_survey_reference(
    district,
    taluka,
    village,
    survey_number
):

    surveys = load_surveys()

    district_value = normalize_location(district)
    taluka_value = normalize_location(taluka)
    village_value = normalize_location(village)

    if district_value not in surveys:
        return {
            "status": "unknown",
            "message": "District not available in survey reference data."
        }

    district_data = surveys[district_value]

    if taluka_value not in district_data:
        return {
            "status": "unknown",
            "message": "Taluka not available in survey reference data."
        }

    taluka_data = district_data[taluka_value]

    village_candidates = None
    for v_key, candidates in taluka_data.items():
        if normalize_location(v_key) == village_value:
            village_candidates = candidates
            break

    if village_candidates is None:
        return {
            "status": "unknown",
            "message": "Village not available in survey reference data."
        }

    if not survey_number:
        return {
            "status": "unknown",
            "message": "Survey number not provided for reference validation."
        }

    survey_number_str = str(survey_number).strip()

    if survey_number_str in village_candidates:
        return {
            "status": "valid",
            "message": "Survey number found in reference data.",
            "matched_value": survey_number_str,
            "similarity": 1.0
        }

    match = find_best_match(
        survey_number_str,
        village_candidates,
        threshold=0.70
    )

    if match:
        return {
            "status": "possible_error",
            "message": "Survey number not found, but a similar value exists.",
            "extracted_value": survey_number_str,
            "suggested_value": match["value"],
            "similarity": match["similarity"]
        }

    return {
        "status": "invalid",
        "message": "Survey number not found in reference data."
    }