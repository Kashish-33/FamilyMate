from datetime import date
from pydantic import BaseModel


class DocumentCreate(BaseModel):
    member_id: int
    document_type: str
    custom_document_name: str | None = None
    file_path: str
    issue_date: date | None = None
    expiry_date: date | None = None
    reminder_days_before: int

class ExtractedDocument(BaseModel):
    document_type: str
    extracted_fields: dict[str, str]