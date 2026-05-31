from typing import List, Optional

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.access import assert_manager_of_employee, assert_manager_of_sheet
from app.events.types import DomainEvent, channel_user
from app.services.audit_service import log_action
from app.services.event_bus import publish
from app.services.uom_utils import normalize_uom_type


def get_team_members_for_checkin(db: Session, manager_id: int) -> List[dict]:
    subordinate_ids = [
        row.employee_id
        for row in db.query(models.OrgHierarchy)
        .filter(models.OrgHierarchy.manager_id == manager_id)
        .all()
    ]
    if not subordinate_ids:
        return []

    employees = {
        user.id: user
        for user in db.query(models.User).filter(models.User.id.in_(subordinate_ids)).all()
    }
    approved_sheets = (
        db.query(models.GoalSheet)
        .filter(
            models.GoalSheet.user_id.in_(subordinate_ids),
            models.GoalSheet.status == "APPROVED",
        )
        .order_by(models.GoalSheet.user_id, models.GoalSheet.id.desc())
        .all()
    )
    latest_sheet_by_employee: dict[int, models.GoalSheet] = {}
    for sheet in approved_sheets:
        if sheet.user_id not in latest_sheet_by_employee:
            latest_sheet_by_employee[sheet.user_id] = sheet

    result = []
    for employee_id, sheet in latest_sheet_by_employee.items():
        employee = employees.get(employee_id)
        result.append(
            {
                "employee_id": employee_id,
                "employee_email": employee.email if employee else "unknown",
                "goal_sheet_id": sheet.id,
                "sheet_status": sheet.status,
            }
        )
    return result


def get_employee_checkin_context(
    db: Session, manager_id: int, employee_id: int, quarter: str = "Q1"
) -> dict:
    assert_manager_of_employee(db, manager_id, employee_id)

    employee = db.query(models.User).filter(models.User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    sheet = (
        db.query(models.GoalSheet)
        .filter(
            models.GoalSheet.user_id == employee_id,
            models.GoalSheet.status == "APPROVED",
        )
        .order_by(models.GoalSheet.id.desc())
        .first()
    )
    if not sheet:
        raise HTTPException(status_code=404, detail="No approved goal sheet for employee")

    goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()
    goal_ids = [goal.id for goal in goals]
    achievements = {}
    if goal_ids:
        achievements = {
            ach.goal_id: ach
            for ach in db.query(models.QuarterlyAchievement)
            .filter(
                models.QuarterlyAchievement.goal_id.in_(goal_ids),
                models.QuarterlyAchievement.quarter == quarter,
            )
            .all()
        }

    metrics = []
    for goal in goals:
        achievement = achievements.get(goal.id)
        progress_score = achievement.progress_percentage if achievement else 0.0
        metrics.append(
            {
                "goal_id": goal.id,
                "title": goal.title,
                "uom_type": goal.uom_type,
                "target_value": goal.target_value,
                "actual_value": progress_score if goal.uom_type else progress_score,
                "progress_score": progress_score,
                "quarter": quarter,
            }
        )

    return {
        "employee_id": employee_id,
        "employee_email": employee.email,
        "goal_sheet_id": sheet.id,
        "sheet_status": sheet.status,
        "goals": metrics,
    }


def create_checkin(
    db: Session,
    manager_id: int,
    checkin_in: schemas.CheckinCreate,
    background_tasks: Optional[BackgroundTasks] = None,
):
    sheet = assert_manager_of_sheet(db, manager_id, checkin_in.goal_sheet_id)

    checkin = models.ManagerCheckin(
        goal_sheet_id=checkin_in.goal_sheet_id,
        manager_id=manager_id,
        status=checkin_in.status,
    )
    db.add(checkin)
    db.flush()

    if checkin_in.comment_text:
        comment = models.Comment(
            checkin_id=checkin.id,
            author_id=manager_id,
            text=checkin_in.comment_text,
        )
        db.add(comment)

    db.commit()
    db.refresh(checkin)

    log_action(db, manager_id, "CREATE_CHECKIN", f"Checkin:{checkin.id}")

    publish(
        DomainEvent(
            type="checkin.created",
            channels=[channel_user(sheet.user_id)],
            actor_id=manager_id,
            resource_type="checkin",
            resource_id=checkin.id,
            payload={"goal_sheet_id": sheet.id},
        )
    )

    from app.services.notification_service import create_notification

    create_notification(
        db,
        user_id=sheet.user_id,
        type="checkin.created",
        title="Manager check-in recorded",
        body=checkin_in.comment_text or "Your manager completed a check-in.",
        resource_type="checkin",
        resource_id=checkin.id,
        actor_id=manager_id,
        background_tasks=background_tasks,
        send_external=True,
    )

    return checkin
