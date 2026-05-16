from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CheckinCreate(BaseModel):
    goal_sheet_id: int
    status: str
    comment_text: Optional[str] = None  # Optional initial comment during check-in

class CheckinOut(BaseModel):
    id: int
    goal_sheet_id: int
    manager_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
