from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str
):
    existing_notification = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.title == title,
        Notification.message == message,
        Notification.notification_type == notification_type,
        Notification.is_read == False
    ).first()

    if existing_notification:
        return existing_notification

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications_for_user(
    db: Session,
    user_id: int,
    unread_only: bool = False
):
    query = db.query(Notification).filter(
        Notification.user_id == user_id
    )

    if unread_only:
        query = query.filter(
            Notification.is_read == False
        )

    return query.order_by(
        Notification.created_at.desc()
    ).all()


def get_unread_count_for_user(
    db: Session,
    user_id: int
) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def mark_notification_as_read(
    db: Session,
    notification: Notification
):
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_notifications_as_read(
    db: Session,
    user_id: int
) -> int:
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return len(notifications)