from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, dependencies

router = APIRouter()

@router.post("/", response_model=schemas.ProgressOut)
def log_quarterly_actuals(
    achievement_in: schemas.AchievementUpdate,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Submit quarterly achievement and progress score."""
    pass

@router.get("/{goal_id}", response_model=List[schemas.ProgressOut])
def get_goal_achievements(
    goal_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user = Depends(dependencies.get_current_active_user)
):
    """Get history of progress updates for a specific goal."""
    pass
