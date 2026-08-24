from datetime import date
from pydantic import BaseModel


class MedicineCreate(BaseModel):
    member_id: int
    medicine_name: str
    dosage: str | None = None
    frequency: str | None = None
    expiry_date: date | None = None


class ExtractedMedicine(BaseModel):
    medicine_name: str
    extracted_fields: dict[str, str]