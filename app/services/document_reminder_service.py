from datetime import date

from app.services.document_expiry_service import get_document_status
from app.services.notification_service import create_notification


def get_expiring_documents(documents, user_id, db):
    reminders = []

    today = date.today()

    for document in documents:

        status = get_document_status(
            document.expiry_date,
            document.reminder_days_before
        )

        if status == "EXPIRING_SOON":
            days_remaining = (
                document.expiry_date - today
            ).days

            create_notification(
                db=db,
                user_id=user_id,
                title="Document Expiring Soon",
                message=f"{document.document_type} will expire in {days_remaining} days.",
                notification_type="DOCUMENT_EXPIRY"
            )

            reminders.append({
                "document_id": document.id,
                "member_id": document.member_id,
                "document_type": document.document_type,
                "expiry_date": document.expiry_date,
                "days_remaining": days_remaining
            })

    return reminders