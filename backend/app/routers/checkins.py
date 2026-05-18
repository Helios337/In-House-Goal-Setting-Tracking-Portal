from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app import schemas, dependencies
from app.core.database import get_db
from app.services import checkin_service

router = APIRouter()


@router.get("/team", response_model=list[schemas.TeamMemberSummary])
def list_team_for_checkin(
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return checkin_service.get_team_members_for_checkin(db, current_manager.id)


@router.get("/employee/{employee_id}", response_model=schemas.EmployeeCheckinContext)
def get_employee_checkin_data(
    employee_id: int,
    quarter: str = "Q1",
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return checkin_service.get_employee_checkin_context(
        db, current_manager.id, employee_id, quarter=quarter
    )


@router.post("/", response_model=schemas.CheckinOut)
def create_manager_checkin(
    checkin_in: schemas.CheckinCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_manager=Depends(dependencies.require_manager_role),
):
    return checkin_service.create_checkin(
        db, current_manager.id, checkin_in, background_tasks=background_tasks
    )
