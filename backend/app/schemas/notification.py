from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    read_at: Optional[datetime] = None
    delivery_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListOut(BaseModel):
    notifications: list[NotificationOut]
    unread_count: int
