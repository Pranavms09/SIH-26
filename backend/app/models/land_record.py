from pydantic import BaseModel
from typing import Optional


class ExtractedField(BaseModel):
    value: Optional[str] = None
    confidence: float = 0.0


class LandRecord(BaseModel):

    district: ExtractedField = ExtractedField()

    taluka: ExtractedField = ExtractedField()

    village: ExtractedField = ExtractedField()

    survey_number: ExtractedField = ExtractedField()

    land_holding_type: ExtractedField = ExtractedField()

    owner_name: ExtractedField = ExtractedField()

    area: ExtractedField = ExtractedField()