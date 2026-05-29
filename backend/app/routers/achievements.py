from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas, dependencies
from app.core.database import get_db
from app.services import achievement_service

router = APIRouter()


@router.post("", response_model=schemas.ProgressOut)
@router.post("/", response_model=schemas.ProgressOut)
def log_quarterly_actuals(
    achievement_in: schemas.AchievementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return achievement_service.log_achievement(db, current_user.id, achievement_in)


@router.get("/{goal_id}", response_model=List[schemas.ProgressOut])
def get_goal_achievements(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return achievement_service.get_goal_achievements(db, goal_id, current_user.id)
