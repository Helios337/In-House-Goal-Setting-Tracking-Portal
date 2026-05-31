from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import dependencies
from app.core.access import resolve_manager_scope
from app.core.database import get_db
from app.services import goal_service

router = APIRouter()


@router.get("")
def get_team_goals(
    managerId: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.require_manager_role),
):
    manager_id = resolve_manager_scope(db, current_user, managerId)
    return goal_service.get_pending_approvals(db, manager_id)
