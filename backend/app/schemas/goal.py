from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    weightage: int = Field(default=10, ge=10, le=100)
    thrust_area_id: Optional[int] = None
    uom_type: Optional[str] = None
    target_value: Optional[float] = None

class GoalCreate(GoalBase):
    goal_sheet_id: int

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    weightage: Optional[int] = Field(default=None, ge=10, le=100)
    uom_type: Optional[str] = None
    target_value: Optional[float] = None

class GoalOut(GoalBase):
    id: int
    owner_id: int
    goal_sheet_id: int

    model_config = ConfigDict(from_attributes=True)


class GoalSheetSummary(BaseModel):
    id: int
    cycle_id: int
    status: str
    goal_count: int
    total_weightage: int
    cycle_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GoalSheetDetail(BaseModel):
    id: int
    cycle_id: int
    status: str
    total_weightage: int
    cycle_name: Optional[str] = None
    goals: List[GoalOut] = []

    model_config = ConfigDict(from_attributes=True)
