from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import dependencies
from app.core.database import get_db
from app.services import goal_service

router = APIRouter()


@router.get("/")
def get_team_goals(
    managerId: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.require_manager_role),
):
    manager_id = managerId or current_user.id
    return goal_service.get_pending_approvals(db, manager_id)
