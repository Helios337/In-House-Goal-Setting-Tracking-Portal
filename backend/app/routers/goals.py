from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app import schemas, dependencies
from app.core.database import get_db
from app.services import goal_service

router = APIRouter()


@router.post("/", response_model=schemas.GoalOut)
def create_goal(
    goal_in: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.create_goal(db, goal_in=goal_in, owner_id=current_user.id)


@router.get("/current", response_model=List[schemas.GoalOut])
def read_current_goals(
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.get_goals_for_user(db, current_user.id)


@router.get("/sheets", response_model=List[schemas.GoalSheetSummary])
def list_goal_sheets(
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.list_sheets_for_user(db, current_user.id)


@router.get("/sheets/current", response_model=schemas.GoalSheetDetail)
def read_current_sheet(
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.get_current_sheet_detail(db, current_user.id)


@router.get("/sheets/{sheet_id}", response_model=schemas.GoalSheetDetail)
def read_goal_sheet(
    sheet_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    allow_manager = False
    role = current_user.role.name.upper() if current_user.role else ""
    if role in dependencies.MANAGER_ACCESS_ROLES:
        allow_manager = True
    return goal_service.get_sheet_detail(
        db, sheet_id, current_user.id, allow_manager=allow_manager
    )


@router.get("/", response_model=List[schemas.GoalOut])
def read_goals(
    cycle: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.get_goals_for_user(db, current_user.id, cycle_id=cycle)


@router.put("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(
    goal_id: int,
    goal_in: schemas.GoalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.update_goal(db, goal_id, goal_in, current_user.id)


@router.post("/{sheet_id}/submit")
def submit_goal_sheet(
    sheet_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    return goal_service.lock_goal_sheet(
        db,
        sheet_id,
        current_user.id,
        is_manager=False,
        background_tasks=background_tasks,
    )


@router.post("/{sheet_id}/approve")
def approve_goal_sheet(
    sheet_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return goal_service.lock_goal_sheet(
        db,
        sheet_id,
        current_manager.id,
        is_manager=True,
        background_tasks=background_tasks,
    )


@router.get("/manager/pending-approvals")
def pending_approvals(
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return goal_service.get_pending_approvals(db, current_manager.id)
