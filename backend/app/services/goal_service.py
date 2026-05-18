from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from typing import List, Optional

from app import models, schemas
from app.events.types import DomainEvent, channel_user, channel_team, channel_goal
from app.services.audit_service import log_action
from app.services.event_bus import publish
from app.services.cycle_service import require_phase_active
from app.services.notification_service import notify_manager_sheet_submitted

MAX_GOALS = 8
MIN_GOAL_WEIGHT = 10
REQUIRED_TOTAL_WEIGHT = 100
GOAL_SETTING_PHASE = "Goal Setting"


def validate_single_goal_weight(weightage: int):
    if weightage < MIN_GOAL_WEIGHT:
        raise HTTPException(
            status_code=400,
            detail=f"Each goal must have at least {MIN_GOAL_WEIGHT}% weightage.",
        )


def validate_goal_count(db: Session, goal_sheet_id: int, adding: int = 1):
    count = (
        db.query(models.Goal)
        .filter(models.Goal.goal_sheet_id == goal_sheet_id)
        .count()
    )
    if count + adding > MAX_GOALS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_GOALS} goals allowed per sheet.",
        )


def validate_sheet_ready_for_submit(db: Session, sheet_id: int):
    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet_id).all()
    if not goals:
        raise HTTPException(status_code=400, detail="Goal sheet must contain at least one goal.")
    if len(goals) > MAX_GOALS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_GOALS} goals allowed per sheet.",
        )
    for goal in goals:
        validate_single_goal_weight(goal.weightage)
    total = sum(g.weightage for g in goals)
    if total != REQUIRED_TOTAL_WEIGHT:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Total weightage must equal exactly {REQUIRED_TOTAL_WEIGHT}%. "
                f"Current total: {total}%."
            ),
        )


def validate_weightage(
    db: Session,
    goal_sheet_id: int,
    new_goal_weight: int = 0,
    updating_goal_id: int = None,
):
    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == goal_sheet_id).all()
    current_total = sum(g.weightage for g in goals if g.id != updating_goal_id)
    if current_total + new_goal_weight > 100:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Total weightage cannot exceed 100%. "
                f"Current: {current_total}%, Attempted: {new_goal_weight}%"
            ),
        )


def check_sheet_lock(db: Session, goal_sheet_id: int):
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == goal_sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")
    if sheet.status in ["SUBMITTED", "APPROVED"]:
        raise HTTPException(
            status_code=403,
            detail=f"Cannot modify goals. Sheet is {sheet.status}.",
        )


def get_or_create_current_sheet(db: Session, user_id: int) -> models.GoalSheet:
    cycle = (
        db.query(models.CheckinCycle)
        .order_by(models.CheckinCycle.start_date.desc())
        .first()
    )
    if not cycle:
        raise HTTPException(status_code=400, detail="No active check-in cycle configured.")

    sheet = (
        db.query(models.GoalSheet)
        .filter(
            models.GoalSheet.user_id == user_id,
            models.GoalSheet.cycle_id == cycle.id,
        )
        .first()
    )
    if not sheet:
        sheet = models.GoalSheet(user_id=user_id, cycle_id=cycle.id, status="DRAFT")
        db.add(sheet)
        db.commit()
        db.refresh(sheet)
    return sheet


def get_goals_for_user(
    db: Session, user_id: int, cycle_id: Optional[int] = None
) -> List[models.Goal]:
    if cycle_id:
        sheet = (
            db.query(models.GoalSheet)
            .filter(
                models.GoalSheet.user_id == user_id,
                models.GoalSheet.cycle_id == cycle_id,
            )
            .first()
        )
    else:
        sheet = get_or_create_current_sheet(db, user_id)

    if not sheet:
        return []
    return db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()


def create_goal(db: Session, goal_in: schemas.GoalCreate, owner_id: int):
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == goal_in.goal_sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")
    require_phase_active(db, GOAL_SETTING_PHASE, sheet.cycle_id)
    check_sheet_lock(db, goal_in.goal_sheet_id)
    validate_goal_count(db, goal_in.goal_sheet_id)
    validate_single_goal_weight(goal_in.weightage)
    validate_weightage(db, goal_in.goal_sheet_id, goal_in.weightage)

    db_goal = models.Goal(**goal_in.model_dump(), owner_id=owner_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    log_action(db, owner_id, "CREATE_GOAL", f"Goal:{db_goal.id}")

    viewer_ids = _shared_viewer_ids(db, db_goal.id)
    channels = [channel_user(owner_id)] + [channel_user(v) for v in viewer_ids]
    publish(
        DomainEvent(
            type="goal.updated",
            channels=channels,
            actor_id=owner_id,
            resource_type="goal",
            resource_id=db_goal.id,
        )
    )
    return db_goal


def update_goal(
    db: Session, goal_id: int, goal_in: schemas.GoalUpdate, user_id: int
):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == goal.goal_sheet_id).first()
    if sheet:
        require_phase_active(db, GOAL_SETTING_PHASE, sheet.cycle_id)
    check_sheet_lock(db, goal.goal_sheet_id)
    update_data = goal_in.model_dump(exclude_unset=True)
    if "weightage" in update_data:
        validate_single_goal_weight(update_data["weightage"])
        validate_weightage(
            db,
            goal.goal_sheet_id,
            update_data["weightage"],
            updating_goal_id=goal_id,
        )

    for field, value in update_data.items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)

    log_action(db, user_id, "UPDATE_GOAL", f"Goal:{goal.id}")

    viewer_ids = _shared_viewer_ids(db, goal.id)
    channels = [channel_user(user_id)] + [channel_user(v) for v in viewer_ids]
    publish(
        DomainEvent(
            type="goal.updated",
            channels=channels,
            actor_id=user_id,
            resource_type="goal",
            resource_id=goal.id,
        )
    )
    return goal


def _get_manager_for_employee(db: Session, employee_id: int) -> Optional[models.User]:
    hierarchy = (
        db.query(models.OrgHierarchy)
        .filter(models.OrgHierarchy.employee_id == employee_id)
        .first()
    )
    if not hierarchy:
        return None
    return db.query(models.User).filter(models.User.id == hierarchy.manager_id).first()


def _shared_viewer_ids(db: Session, goal_id: int) -> List[int]:
    links = db.query(models.SharedGoal).filter(models.SharedGoal.goal_id == goal_id).all()
    return [link.user_id for link in links]


def lock_goal_sheet(
    db: Session,
    sheet_id: int,
    action_user_id: int,
    is_manager: bool = False,
    background_tasks: Optional[BackgroundTasks] = None,
):
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")

    employee = db.query(models.User).filter(models.User.id == sheet.user_id).first()

    if is_manager:
        if sheet.status != "SUBMITTED":
            raise HTTPException(
                status_code=400,
                detail="Only submitted goal sheets can be approved.",
            )
        validate_sheet_ready_for_submit(db, sheet_id)
        sheet.status = "APPROVED"
        log_action(db, action_user_id, "APPROVE_SHEET", f"GoalSheet:{sheet.id}")
        event_type = "goal.sheet.approved"
        notify_user_id = sheet.user_id
        title = "Your goal sheet was approved"
        body = f"Goal sheet #{sheet.id} has been approved and locked."
    else:
        if sheet.user_id != action_user_id:
            raise HTTPException(status_code=403, detail="Not authorized to submit this sheet.")
        if sheet.status not in ("DRAFT", "SUBMITTED"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot submit sheet in status {sheet.status}.",
            )
        require_phase_active(db, GOAL_SETTING_PHASE, sheet.cycle_id)
        validate_sheet_ready_for_submit(db, sheet_id)
        sheet.status = "SUBMITTED"
        log_action(db, action_user_id, "SUBMIT_SHEET", f"GoalSheet:{sheet.id}")
        event_type = "goal.sheet.submitted"
        notify_user_id = None
        title = None
        body = None

    db.commit()
    db.refresh(sheet)

    channels = [channel_user(sheet.user_id)]
    manager = _get_manager_for_employee(db, sheet.user_id)
    if manager:
        channels.append(channel_team(manager.id))
        channels.append(channel_user(manager.id))

    publish(
        DomainEvent(
            type=event_type,
            channels=channels,
            actor_id=action_user_id,
            resource_type="goal_sheet",
            resource_id=sheet.id,
            payload={"status": sheet.status, "user_id": sheet.user_id},
        )
    )

    if is_manager and employee:
        from app.services.notification_service import create_notification

        create_notification(
            db,
            user_id=sheet.user_id,
            type="goal.sheet.approved",
            title="Your goal sheet was approved",
            body=f"Goal sheet #{sheet.id} has been approved.",
            resource_type="goal_sheet",
            resource_id=sheet.id,
            actor_id=action_user_id,
            background_tasks=background_tasks,
            send_external=True,
        )
    elif not is_manager and manager and background_tasks:
        employee_name = employee.email if employee else "Employee"
        notify_manager_sheet_submitted(
            db,
            background_tasks,
            manager.id,
            manager.email,
            employee_name,
            sheet.id,
            action_user_id,
        )

    return sheet


def _sheet_summary(db: Session, sheet: models.GoalSheet) -> dict:
    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()
    cycle = (
        db.query(models.CheckinCycle)
        .filter(models.CheckinCycle.id == sheet.cycle_id)
        .first()
    )
    return {
        "id": sheet.id,
        "cycle_id": sheet.cycle_id,
        "status": sheet.status,
        "goal_count": len(goals),
        "total_weightage": sum(g.weightage for g in goals),
        "cycle_name": cycle.name if cycle else f"Cycle {sheet.cycle_id}",
    }


def _can_view_sheet(
    db: Session, sheet: models.GoalSheet, viewer_id: int, allow_manager: bool = False
) -> bool:
    if sheet.user_id == viewer_id:
        return True
    if not allow_manager:
        return False
    link = (
        db.query(models.OrgHierarchy)
        .filter(
            models.OrgHierarchy.manager_id == viewer_id,
            models.OrgHierarchy.employee_id == sheet.user_id,
        )
        .first()
    )
    return link is not None


def list_sheets_for_user(db: Session, user_id: int) -> list:
    sheets = (
        db.query(models.GoalSheet)
        .filter(models.GoalSheet.user_id == user_id)
        .order_by(models.GoalSheet.id.desc())
        .all()
    )
    return [_sheet_summary(db, sheet) for sheet in sheets]


def get_sheet_detail(
    db: Session, sheet_id: int, viewer_id: int, allow_manager: bool = False
) -> dict:
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Goal Sheet not found")
    if not _can_view_sheet(db, sheet, viewer_id, allow_manager):
        raise HTTPException(status_code=403, detail="Not authorized to view this sheet")

    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()
    summary = _sheet_summary(db, sheet)
    summary["goals"] = goals
    return summary


def get_current_sheet_detail(db: Session, user_id: int) -> dict:
    sheet = get_or_create_current_sheet(db, user_id)
    return get_sheet_detail(db, sheet.id, user_id)


def get_pending_approvals(db: Session, manager_id: int) -> list[dict]:
    subordinate_ids = [
        row.employee_id
        for row in db.query(models.OrgHierarchy)
        .filter(models.OrgHierarchy.manager_id == manager_id)
        .all()
    ]
    if not subordinate_ids:
        return []

    sheets = (
        db.query(models.GoalSheet)
        .filter(
            models.GoalSheet.user_id.in_(subordinate_ids),
            models.GoalSheet.status == "SUBMITTED",
        )
        .all()
    )
    result: list[dict] = []
    for sheet in sheets:
        employee = db.query(models.User).filter(models.User.id == sheet.user_id).first()
        goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()
        serialized_goals = [
            schemas.GoalOut.model_validate(goal).model_dump() for goal in goals
        ]
        result.append(
            {
                "employeeId": str(sheet.user_id),
                "employeeName": employee.email if employee else "Unknown",
                "goalSheetId": sheet.id,
                "status": "Pending Approval",
                "goals": serialized_goals,
            }
        )
    return result
