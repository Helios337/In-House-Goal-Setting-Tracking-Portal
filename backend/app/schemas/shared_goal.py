from pydantic import BaseModel

class SharedGoalPush(BaseModel):
    user_id: int
    goal_id: int
    permission_level: str = "VIEWER"

class WeightageUpdate(BaseModel):
    goal_id: int
    new_weightage: int
