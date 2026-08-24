from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.family import Family
from app.models.user import User
from app.schemas.family import FamilyCreate
from app.routers.user import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_family(
    family: FamilyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    print("Current User ID:", current_user.id)

    existing_family = db.query(Family).filter(
        Family.owner_id == current_user.id
    ).first()

    print("Existing Family:", existing_family)

    if existing_family:
        raise HTTPException(
            status_code=400,
            detail="You already have a family."
        )

    new_family = Family(
        family_name=family.family_name,
        owner_id=current_user.id
    )

    db.add(new_family)
    db.commit()
    db.refresh(new_family)

    return {
        "message": "Family created successfully",
        "family_id": new_family.id
    }

@router.get("/me")
def get_my_family(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    family = db.query(Family).filter(
        Family.owner_id == current_user.id
    ).first()

    if family is None:
        raise HTTPException(
            status_code=404,
            detail="Family not found"
        )

    return {
        "id": family.id,
        "family_name": family.family_name,
        "owner_id": family.owner_id
    }