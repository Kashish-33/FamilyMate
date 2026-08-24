from datetime import datetime
from pydantic import BaseModel


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int