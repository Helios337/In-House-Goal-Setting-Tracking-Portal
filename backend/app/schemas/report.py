from pydantic import BaseModel
from typing import List

class AchievementReportRow(BaseModel):
    user_id: int
    user_email: str
    goal_id: int
    goal_title: str
    quarter: str
    progress: float

class DashboardOut(BaseModel):
    total_users: int
    active_cycles: int
    company_average_progress: float
    reports: List[AchievementReportRow]
