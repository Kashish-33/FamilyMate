from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal

from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.user import User

from app.schemas.family_member import FamilyMemberCreate

from app.routers.user import get_current_user


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_family_member(
    member: FamilyMemberCreate,
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

    new_member = FamilyMember(
        name=member.name,
        relation=member.relation,
        age=member.age,
        gender=member.gender,
        phone=member.phone,
        family_id=family.id
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {
        "message": "Family member created successfully",
        "member_id": new_member.id
    }

@router.get("/")
def get_family_members(
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

    members = db.query(FamilyMember).filter(
        FamilyMember.family_id == family.id
    ).all()

    return members


@router.get("/{member_id}")
def get_family_member(
    member_id: int,
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

    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Family member not found"
        )

    return {
        "id": member.id,
        "name": member.name,
        "relation": member.relation,
        "age": member.age,
        "gender": member.gender,
        "phone": member.phone
    }


@router.put("/{member_id}")
def update_family_member(
    member_id: int,
    member: FamilyMemberCreate,
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

    existing_member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.family_id == family.id
    ).first()

    if existing_member is None:
        raise HTTPException(
            status_code=404,
            detail="Family member not found"
        )

    existing_member.name = member.name
    existing_member.relation = member.relation
    existing_member.age = member.age
    existing_member.gender = member.gender
    existing_member.phone = member.phone

    db.commit()
    db.refresh(existing_member)

    return {
        "message": "Family member updated successfully",
        "member_id": existing_member.id
    }

@router.delete("/{member_id}")
def delete_family_member(
    member_id: int,
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

    existing_member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.family_id == family.id
    ).first()

    if existing_member is None:
        raise HTTPException(
            status_code=404,
            detail="Family member not found"
        )

    db.delete(existing_member)
    db.commit()

    return {
        "message": "Family member deleted successfully"
    }