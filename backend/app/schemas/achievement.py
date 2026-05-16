from pydantic import BaseModel, ConfigDict
from typing import Optional

class AchievementUpdate(BaseModel):
    progress_percentage: float
    narrative: Optional[str] = None

class ProgressOut(BaseModel):
    id: int
    goal_id: int
    quarter: str
    progress_percentage: float
    narrative: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
