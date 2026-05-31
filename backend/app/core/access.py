"""Reusable authorization helpers (object-level / relationship checks)."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import models


def assert_sheet_owned_by(db: Session, sheet_id: int, user_id: int) -> models.GoalSheet:
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal Sheet not found")
    if sheet.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this goal sheet",
        )
    return sheet


def assert_manager_of_employee(db: Session, manager_id: int, employee_id: int) -> None:
    link = (
        db.query(models.OrgHierarchy)
        .filter_by(manager_id=manager_id, employee_id=employee_id)
        .first()
    )
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not manager for this employee",
        )


def assert_manager_of_sheet(db: Session, manager_id: int, sheet_id: int) -> models.GoalSheet:
    sheet = db.query(models.GoalSheet).filter(models.GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal Sheet not found")
    assert_manager_of_employee(db, manager_id, sheet.user_id)
    return sheet


def assert_goal_owner_or_shared(
    db: Session, goal_id: int, user_id: int, *, write: bool = False
) -> models.Goal:
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    if goal.owner_id == user_id:
        return goal
    link = (
        db.query(models.SharedGoal)
        .filter_by(user_id=user_id, goal_id=goal_id)
        .first()
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if write and link.permission_level not in ("CONTRIBUTOR", "OWNER"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return goal


def resolve_manager_scope(
    db: Session,
    current_user: models.User,
    requested_manager_id: int | None,
) -> int:
    """Managers may only query their own team unless they are ADMIN."""
    if requested_manager_id is None or requested_manager_id == current_user.id:
        return current_user.id

    role_name = str(current_user.role.name).upper() if current_user.role else ""
    if role_name not in ("ADMIN",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view another manager's team data",
        )

    target = db.query(models.User).filter(models.User.id == requested_manager_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manager not found")
    return requested_manager_id
