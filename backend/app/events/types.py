from datetime import datetime, timezone
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class DomainEvent(BaseModel):
    type: str
    channels: List[str]
    actor_id: Optional[int] = None
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    payload: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


def channel_user(user_id: int) -> str:
    return f"user:{user_id}"


def channel_team(manager_id: int) -> str:
    return f"team:{manager_id}"


def channel_goal(goal_id: int) -> str:
    return f"goal:{goal_id}"
