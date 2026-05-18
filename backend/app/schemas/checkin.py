from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional


class CheckinCreate(BaseModel):
    goal_sheet_id: int
    status: str
    comment_text: Optional[str] = None


class CheckinOut(BaseModel):
    id: int
    goal_sheet_id: int
    manager_id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeGoalMetric(BaseModel):
    goal_id: int
    title: str
    uom_type: Optional[str] = None
    target_value: Optional[float] = None
    actual_value: Optional[float] = None
    progress_score: float = 0.0
    quarter: Optional[str] = None


class EmployeeCheckinContext(BaseModel):
    employee_id: int
    employee_email: str
    goal_sheet_id: int
    sheet_status: str
    goals: List[EmployeeGoalMetric] = []


class TeamMemberSummary(BaseModel):
    employee_id: int
    employee_email: str
    goal_sheet_id: int
    sheet_status: str
