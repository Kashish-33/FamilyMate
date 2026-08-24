from app.core.database import SessionLocal
from app.models.family_member import FamilyMember
from app.models.medicine import Medicine
from app.models.document import Document

from app.services.medicine_reminder_service import get_expiring_medicines
from app.services.document_reminder_service import get_expiring_documents


def check_all_reminders():

    db = SessionLocal()

    try:
        members = db.query(FamilyMember).all()

        member_ids = [member.id for member in members]

        medicines = db.query(Medicine).filter(
            Medicine.member_id.in_(member_ids)
        ).all()

        documents = db.query(Document).filter(
            Document.member_id.in_(member_ids)
        ).all()

        for member in members:

            user_id = member.family.owner_id

            member_medicines = [
                medicine
                for medicine in medicines
                if medicine.member_id == member.id
            ]

            member_documents = [
                document
                for document in documents
                if document.member_id == member.id
            ]

            get_expiring_medicines(
                member_medicines,
                user_id,
                db
            )

            get_expiring_documents(
                member_documents,
                user_id,
                db
            )

    finally:
        db.close()