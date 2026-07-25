from fastapi import FastAPI

from app.database import Base, engine
from app.models.user import User
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.document import Document

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": " AI Family Copilot Backend Running"}