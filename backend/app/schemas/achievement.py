from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AchievementUpdate(BaseModel):
    goal_id: int
    quarter: str
    progress_percentage: Optional[float] = None
    actual_value: Optional[float] = None
    narrative: Optional[str] = None


class ProgressOut(BaseModel):
    id: int
    goal_id: int
    quarter: str
    progress_percentage: float
    narrative: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
