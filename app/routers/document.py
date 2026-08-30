import logging
import os
import shutil
import uuid

from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.core.database import SessionLocal

from app.models.document import Document
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.user import User

from app.schemas.document import DocumentCreate
from fastapi import Form, File, UploadFile
from app.core.config import UPLOAD_DIR

from app.routers.user import get_current_user

from app.services.llm_service import extract_document_data
from app.services.document_expiry_service import get_document_status
from app.services.document_reminder_service import get_expiring_documents


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_document(
    member_id: int = Form(...),
    document_type: str = Form(...),
    custom_document_name: str | None = Form(None),
    issue_date: date | None = Form(None),
    expiry_date: date | None = Form(None),
    reminder_days_before: int = Form(...),
    file: UploadFile = File(...),

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
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, JPG, JPEG and PNG are allowed."
        )

    logger.info(f"[DOC UPLOAD] Received request: member_id={member_id}, doc_type={document_type}, filename={file.filename}")

    unique_filename = f"{filename}_{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        file_bytes = file.file.read()

        mime_types = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
        }
        mime_type = file.content_type or mime_types.get(extension, "image/jpeg")

        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
        logger.info(f"[DOC UPLOAD] File saved to disk: path={file_path}, size={len(file_bytes)} bytes")

        logger.info(f"[DOC UPLOAD] Calling Gemini extraction (mime_type={mime_type})...")
        extracted_data = extract_document_data(file_bytes=file_bytes, mime_type=mime_type)
        logger.info(f"[DOC UPLOAD] Gemini extraction completed: type='{extracted_data.document_type}', fields_count={len(extracted_data.extracted_fields)}")

        new_document = Document(
            member_id=member.id,
            document_type=document_type,
            custom_document_name=custom_document_name,
            file_path=file_path,
            issue_date=issue_date,
            expiry_date=expiry_date,
            reminder_days_before=reminder_days_before,
            extracted_data=extracted_data.extracted_fields
        )

        logger.info("[DOC UPLOAD] Committing document record to database...")
        db.add(new_document)
        db.commit()
        db.refresh(new_document)
        logger.info(f"[DOC UPLOAD] Database commit successful: document_id={new_document.id}")

        return {
            "message": "Document uploaded successfully",
            "document_id": new_document.id,
            "extracted_data": extracted_data.model_dump()
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"[DOC UPLOAD] Unexpected error during document upload: {exc}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Document upload processing failed: {str(exc)}"
        )


@router.get("/member/{member_id}")
def get_member_documents(
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

    documents = db.query(Document).filter(
        Document.member_id == member.id
    ).all()

    return [
    {
        "id": document.id,
        "member_id": document.member_id,
        "document_type": document.document_type,
        "custom_document_name": document.custom_document_name,
        "file_path": document.file_path,
        "issue_date": document.issue_date,
        "expiry_date": document.expiry_date,
        "reminder_days_before": document.reminder_days_before,
        "uploaded_at": document.uploaded_at,
        "extracted_data": document.extracted_data,
        "status": get_document_status(
            document.expiry_date,
            document.reminder_days_before
        )
    }
    for document in documents
]


@router.get("/reminders")
def get_document_reminders(
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

    documents = db.query(Document).filter(
        Document.member_id.in_(member_ids)
    ).all()

    reminders = get_expiring_documents(
        documents,
        current_user.id,
        db
    )

    return reminders



@router.get("/{document_id}")
def get_document(
    document_id: int,
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

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    member = db.query(FamilyMember).filter(
        FamilyMember.id == document.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    status = get_document_status(
        document.expiry_date,
        document.reminder_days_before
    )

    return {
    "id": document.id,
    "member_id": document.member_id,
    "document_type": document.document_type,
    "custom_document_name": document.custom_document_name,
    "file_path": document.file_path,
    "issue_date": document.issue_date,
    "expiry_date": document.expiry_date,
    "reminder_days_before": document.reminder_days_before,
    "uploaded_at": document.uploaded_at,
    "extracted_data": document.extracted_data,
    "status": status
}



@router.put("/{document_id}")
def update_document(
    document_id: int,
    document_type: str = Form(...),
    custom_document_name: str | None = Form(None),
    issue_date: date | None = Form(None),
    expiry_date: date | None = Form(None),
    reminder_days_before: int = Form(7),

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find user's family
    family = db.query(Family).filter(
        Family.owner_id == current_user.id
    ).first()

    if family is None:
        raise HTTPException(
            status_code=404,
            detail="Family not found"
        )

    # Find document
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Verify document belongs to user's family
    member = db.query(FamilyMember).filter(
        FamilyMember.id == document.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Update
    document.document_type = document_type
    document.custom_document_name = (
        custom_document_name
    )
    document.issue_date = issue_date
    document.expiry_date = expiry_date
    document.reminder_days_before = (
        reminder_days_before
    )

    db.commit()
    db.refresh(document)

    return {
        "message": "Document updated successfully",
        "document": document
    }


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
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

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    member = db.query(FamilyMember).filter(
        FamilyMember.id == document.member_id,
        FamilyMember.family_id == family.id
    ).first()

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }
