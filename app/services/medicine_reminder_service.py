from datetime import date

from sqlalchemy.orm import Session

from app.services.medicine_expiry_service import get_medicine_status
from app.services.notification_service import create_notification


def get_expiring_medicines(
    medicines,
    user_id: int,
    db: Session
):
    reminders = []

    today = date.today()

    for medicine in medicines:

        status = get_medicine_status(
            medicine.expiry_date,
            7
        )

        if status == "EXPIRING_SOON":
            days_remaining = (
                medicine.expiry_date - today
            ).days

            create_notification(
                db=db,
                user_id=user_id,
                title="Medicine Expiring Soon",
                message=f"{medicine.medicine_name} will expire in {days_remaining} days.",
                notification_type="MEDICINE_EXPIRY"
            )

            reminders.append({
                "medicine_id": medicine.id,
                "member_id": medicine.member_id,
                "medicine_name": medicine.medicine_name,
                "expiry_date": medicine.expiry_date,
                "days_remaining": days_remaining
            })

    return reminders