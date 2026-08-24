from pydantic import BaseModel

class FamilyCreate(BaseModel):
    family_name: str