from sqlalchemy.orm import Session

from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.medicine import Medicine
from app.models.document import Document
from app.models.notification import Notification


from app.services.document_reminder_service import get_document_status

from app.services.medicine_reminder_service import get_expiring_medicines


def get_family_members(
    user_id: int,
    db: Session
):
    family = db.query(Family).filter(
        Family.owner_id == user_id
    ).first()

    if family is None:
        return []

    members = db.query(FamilyMember).filter(
        FamilyMember.family_id == family.id
    ).all()

    return [
        {
            "id": member.id,
            "name": member.name,
            "relation": member.relation
        }
        for member in members
    ]

def get_medicines(
    user_id: int,
    db: Session
):
    family = db.query(Family).filter(
        Family.owner_id == user_id
    ).first()

    if family is None:
        return []

    members = db.query(FamilyMember).filter(
        FamilyMember.family_id == family.id
    ).all()

    member_ids = [member.id for member in members]

    medicines = db.query(Medicine).filter(
        Medicine.member_id.in_(member_ids)
    ).all()

    return [
        {
            "id": medicine.id,
            "member_id": medicine.member_id,
            "medicine_name": medicine.medicine_name,
            "dosage": medicine.dosage,
            "frequency": medicine.frequency,
            "expiry_date": (
                medicine.expiry_date.isoformat()
                if medicine.expiry_date
                else None
            )
        }
        for medicine in medicines
    ]


def get_medicine_reminders(
    user_id: int,
    db: Session
):
    family = db.query(Family).filter(
        Family.owner_id == user_id
    ).first()

    if family is None:
        return []

    members = db.query(FamilyMember).filter(
        FamilyMember.family_id == family.id
    ).all()

    member_ids = [member.id for member in members]

    medicines = db.query(Medicine).filter(
        Medicine.member_id.in_(member_ids)
    ).all()

    reminders = get_expiring_medicines(
        medicines=medicines,
        user_id=user_id,
        db=db
    )

    return [
        {
            **reminder,
            "expiry_date": (
                reminder["expiry_date"].isoformat()
                if reminder.get("expiry_date")
                else None
            )
        }
        for reminder in reminders
    ]


def get_documents(
    user_id: int,
    db: Session
):
    family = db.query(Family).filter(
        Family.owner_id == user_id
    ).first()

    if family is None:
        return []

    members = db.query(FamilyMember).filter(
        FamilyMember.family_id == family.id
    ).all()

    member_ids = [member.id for member in members]

    documents = db.query(Document).filter(
        Document.member_id.in_(member_ids)
    ).all()

    return [
        {
            "id": document.id,
            "member_id": document.member_id,
            "document_type": document.document_type,
            "custom_document_name": document.custom_document_name,
            "file_path": document.file_path,
            "issue_date": (
                document.issue_date.isoformat()
                if document.issue_date
                else None
            ),
            "expiry_date": (
                document.expiry_date.isoformat()
                if document.expiry_date
                else None
            ),
            "reminder_days_before": document.reminder_days_before,
            "uploaded_at": (
                document.uploaded_at.isoformat()
                if document.uploaded_at
                else None
            ),
            "extracted_data": document.extracted_data,
            "status": get_document_status(
                document.expiry_date,
                document.reminder_days_before
            )
        }
        for document in documents
    ]

def get_notifications(
    user_id: int,
    db: Session
):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).all()

    return [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": notification.is_read,
            "created_at": (
                notification.created_at.isoformat()
                if notification.created_at
                else None
            )
        }
        for notification in notifications
    ]