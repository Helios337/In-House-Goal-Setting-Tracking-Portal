from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, dependencies

router = APIRouter()

@router.post("/push")
def push_kpi(
    shared_goal_in: schemas.SharedGoalPush,
    db: Session = Depends(dependencies.get_db),
    current_manager = Depends(dependencies.require_manager_role)
):
    """Push/cascade a KPI down to a subordinate."""
    pass

@router.put("/weightage")
def override_weightage(
    weightage_in: schemas.WeightageUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Update the weightage of a shared/cascaded goal in the target's sheet."""
    pass
