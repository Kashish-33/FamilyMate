from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.notification import Notification
from app.models.user import User
from app.routers.user import get_current_user
from app.schemas.notification import NotificationCreate
from app.services.notification_service import (
    create_notification as create_notification_record,
    get_notifications_for_user,
    get_unread_count_for_user,
    mark_all_notifications_as_read as mark_all_as_read_for_user,
    mark_notification_as_read as mark_single_as_read
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_notifications_for_user(
        db=db,
        user_id=current_user.id
    )


@router.get("/unread")
def get_unread_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_notifications_for_user(
        db=db,
        user_id=current_user.id,
        unread_only=True
    )


@router.get("/unread-count")
def get_unread_notification_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    unread_count = get_unread_count_for_user(
        db=db,
        user_id=current_user.id
    )
    return {
        "unread_count": unread_count
    }


@router.post("/")
def create_notification(
    notification: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_notification_record(
        db=db,
        user_id=current_user.id,
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type
    )

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return mark_single_as_read(
        db=db,
        notification=notification
    )

@router.patch("/read-all")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_count = mark_all_as_read_for_user(
        db=db,
        user_id=current_user.id
    )

    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count
    }
