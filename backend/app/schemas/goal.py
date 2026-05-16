from pydantic import BaseModel, ConfigDict
from typing import Optional

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    weightage: int = 100
    thrust_area_id: Optional[int] = None

class GoalCreate(GoalBase):
    goal_sheet_id: int

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    weightage: Optional[int] = None

class GoalOut(GoalBase):
    id: int
    owner_id: int
    goal_sheet_id: int

    model_config = ConfigDict(from_attributes=True)
