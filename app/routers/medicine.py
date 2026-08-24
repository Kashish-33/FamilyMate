from fastapi import APIRouter

from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

from app.models.medicine import Medicine
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.user import User
from app.routers.user import get_current_user

from app.services.medicine_expiry_service import get_medicine_status
from app.services.medicine_reminder_service import get_expiring_medicines

import os
import shutil
import uuid

from fastapi import File, UploadFile

from app.core.config import UPLOAD_DIR
from app.services.ocr_service import extract_text
from app.services.llm_service import extract_medicine_data

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_medicine(
    member_id: int = Form(...),
    file: UploadFile = File(...),
    expiry_date: date | None = Form(None),

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

    upload_dir = UPLOAD_DIR

    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    filename, extension = os.path.splitext(file.filename)
    extension = extension.lower()

    allowed_extensions = {
       ".jpg",
       ".jpeg",
       ".png"
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG files are allowed."
        )

    unique_filename = f"{filename}_{uuid.uuid4().hex}{extension}"

    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text(file_path)

    extracted_data = extract_medicine_data(extracted_text)

    expiry_date = None

    expiry_date_text = extracted_data.extracted_fields.get("expiry_date")

    if expiry_date_text:
        try:
            expiry_date = datetime.strptime(
                expiry_date_text,
                "%m/%Y"
            ).date().replace(day=1)

        except ValueError:
            try:
                expiry_date = datetime.strptime(
                   expiry_date_text,
                   "%d/%m/%Y"
                ).date()

            except ValueError:
                expiry_date = None

    new_medicine = Medicine(
        member_id=member.id,
        medicine_name=extracted_data.medicine_name,
        dosage=extracted_data.extracted_fields.get("dosage"),
        frequency=extracted_data.extracted_fields.get("frequency"),
        expiry_date=expiry_date,
        extracted_data=extracted_data.extracted_fields
    )

    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)

    return {
        "message": "Medicine uploaded successfully",
        "medicine_id": new_medicine.id,
        "extracted_data": extracted_data.model_dump()
    }


@router.get("/member/{member_id}")
def get_member_medicines(
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

    medicines = db.query(Medicine).filter(
        Medicine.member_id == member.id
    ).all()

    result = []

    for medicine in medicines:
        status = get_medicine_status(
            medicine.expiry_date,
            7
        )

        result.append({
            "id": medicine.id,
            "member_id": medicine.member_id,
            "medicine_name": medicine.medicine_name,
            "dosage": medicine.dosage,
            "frequency": medicine.frequency,
            "expiry_date": medicine.expiry_date,
            "created_at": medicine.created_at,
            "status": status
        })

    return result

@router.get("/reminders")
def get_medicine_reminders(
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

    member_ids = [member.id for member in members]

    medicines = db.query(Medicine).filter(
        Medicine.member_id.in_(member_ids)
    ).all()

    reminders = get_expiring_medicines(
        medicines,
        current_user.id,
        db
    )

    return reminders


@router.get("/{medicine_id}")
def get_medicine(
    medicine_id: int,
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

    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    member = db.query(FamilyMember).filter(
        FamilyMember.id == medicine.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    return medicine

@router.put("/{medicine_id}")
def update_medicine(
    medicine_id: int,
    medicine_name: str = Form(...),
    dosage: str | None = Form(None),
    frequency: str | None = Form(None),
    expiry_date: date | None = Form(None),

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

    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    member = db.query(FamilyMember).filter(
        FamilyMember.id == medicine.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    medicine.medicine_name = medicine_name
    medicine.dosage = dosage
    medicine.frequency = frequency
    medicine.expiry_date = expiry_date

    db.commit()
    db.refresh(medicine)

    return medicine

@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: int,
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

    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    member = db.query(FamilyMember).filter(
        FamilyMember.id == medicine.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found"
        )

    db.delete(medicine)
    db.commit()

    return {
        "message": "Medicine deleted successfully"
    }