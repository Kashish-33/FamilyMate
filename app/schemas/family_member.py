from pydantic import BaseModel


class FamilyMemberCreate(BaseModel):
    name: str
    relation: str
    age: int
    gender: str
    phone: str