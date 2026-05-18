from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import schemas, dependencies
from app.core.database import get_db
from app.services import shared_goal_service

router = APIRouter()


class SyncGoalRequest(BaseModel):
    title: str


class AdminCascadeRequest(BaseModel):
    manager_id: int
    goal_id: int
    employee_ids: list[int]


@router.get("/cascade-options")
def get_cascade_options(
    db: Session = Depends(get_db),
    _admin=Depends(dependencies.require_admin_role),
):
    return shared_goal_service.get_cascade_options(db)


@router.post("/admin/cascade")
def admin_cascade(
    body: AdminCascadeRequest,
    db: Session = Depends(get_db),
    admin=Depends(dependencies.require_admin_role),
):
    return shared_goal_service.admin_cascade_kpi(
        db,
        admin.id,
        body.manager_id,
        body.goal_id,
        body.employee_ids,
    )


@router.post("/push")
def push_kpi(
    shared_goal_in: schemas.SharedGoalPush,
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return shared_goal_service.push_kpi_to_subordinate(
        db,
        current_manager.id,
        shared_goal_in.user_id,
        shared_goal_in.goal_id,
    )


@router.put("/weightage")
def override_weightage(
    weightage_in: schemas.WeightageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return shared_goal_service.update_shared_weightage(
        db, current_user.id, weightage_in.goal_id, weightage_in.new_weightage
    )


@router.put("/{goal_id}/sync")
def sync_goal(
    goal_id: int,
    body: SyncGoalRequest,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return shared_goal_service.sync_linked_goal(
        db, goal_id, body.title, current_user.id
    )
