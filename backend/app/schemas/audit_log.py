from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: int
    action: str
    target_resource: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
