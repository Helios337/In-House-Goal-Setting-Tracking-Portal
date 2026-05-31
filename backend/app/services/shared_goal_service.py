from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models, schemas
from app.core.access import assert_manager_of_employee
from app.events.types import DomainEvent, channel_user, channel_goal
from app.services.audit_service import log_action
from app.services.event_bus import publish


def push_kpi_to_subordinate(
    db: Session, manager_id: int, subordinate_id: int, parent_goal_id: int
):
    hierarchy = (
        db.query(models.OrgHierarchy)
        .filter_by(manager_id=manager_id, employee_id=subordinate_id)
        .first()
    )
    if not hierarchy:
        raise HTTPException(status_code=403, detail="User is not a direct subordinate.")

    parent_goal = (
        db.query(models.Goal).filter(models.Goal.id == parent_goal_id).first()
    )
    if not parent_goal:
        raise HTTPException(status_code=404, detail="Parent goal not found.")
    if parent_goal.owner_id != manager_id:
        raise HTTPException(status_code=403, detail="Not authorized to share this goal.")

    sub_sheet = (
        db.query(models.GoalSheet)
        .filter_by(user_id=subordinate_id, status="DRAFT")
        .first()
    )
    if not sub_sheet:
        raise HTTPException(status_code=400, detail="Subordinate has no active DRAFT sheet.")

    existing = (
        db.query(models.SharedGoal)
        .filter_by(user_id=subordinate_id, goal_id=parent_goal.id)
        .first()
    )
    if existing:
        return existing

    shared_link = models.SharedGoal(
        user_id=subordinate_id,
        goal_id=parent_goal.id,
        permission_level="CONTRIBUTOR",
    )
    db.add(shared_link)
    db.commit()
    db.refresh(shared_link)

    log_action(db, manager_id, "PUSH_KPI", f"Goal:{parent_goal.id}->User:{subordinate_id}")

    publish(
        DomainEvent(
            type="shared_kpi.pushed",
            channels=[
                channel_user(subordinate_id),
                channel_goal(parent_goal.id),
            ],
            actor_id=manager_id,
            resource_type="goal",
            resource_id=parent_goal.id,
            payload={"subordinate_id": subordinate_id},
        )
    )
    return shared_link


def sync_linked_goal(db: Session, goal_id: int, new_title: str, actor_id: int):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if goal.owner_id != actor_id:
        link = (
            db.query(models.SharedGoal)
            .filter_by(user_id=actor_id, goal_id=goal_id)
            .first()
        )
        if not link:
            raise HTTPException(status_code=403, detail="Not authorized to sync this goal")

    goal.title = new_title
    db.commit()
    db.refresh(goal)

    viewer_ids = [
        link.user_id
        for link in db.query(models.SharedGoal)
        .filter(models.SharedGoal.goal_id == goal_id)
        .all()
    ]
    channels = [channel_goal(goal_id)] + [channel_user(uid) for uid in viewer_ids]
    channels.append(channel_user(goal.owner_id))

    publish(
        DomainEvent(
            type="shared_kpi.synced",
            channels=list(set(channels)),
            actor_id=actor_id,
            resource_type="goal",
            resource_id=goal_id,
            payload={"title": new_title},
        )
    )
    return goal


def update_shared_weightage(
    db: Session, user_id: int, goal_id: int, new_weightage: int
):
    link = (
        db.query(models.SharedGoal)
        .filter_by(user_id=user_id, goal_id=goal_id)
        .first()
    )
    if not link:
        raise HTTPException(status_code=404, detail="Shared goal link not found")

    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    from app.services.goal_service import check_sheet_lock, validate_weightage

    check_sheet_lock(db, goal.goal_sheet_id)
    validate_weightage(db, goal.goal_sheet_id, new_weightage, updating_goal_id=goal_id)
    goal.weightage = new_weightage
    db.commit()
    db.refresh(goal)

    publish(
        DomainEvent(
            type="goal.updated",
            channels=[channel_user(user_id), channel_goal(goal_id)],
            actor_id=user_id,
            resource_type="goal",
            resource_id=goal_id,
        )
    )
    return goal


def get_cascade_options(db: Session) -> list:
    """Admin view: managers, their goals, and direct subordinates."""
    managers = (
        db.query(models.User)
        .join(models.Role)
        .filter(models.Role.name.in_(["MANAGER", "ADMIN"]))
        .all()
    )
    options = []
    for manager in managers:
        goals = (
            db.query(models.Goal)
            .filter(models.Goal.owner_id == manager.id)
            .all()
        )
        subordinates = (
            db.query(models.User)
            .join(
                models.OrgHierarchy,
                models.User.id == models.OrgHierarchy.employee_id,
            )
            .filter(models.OrgHierarchy.manager_id == manager.id)
            .all()
        )
        if not goals or not subordinates:
            continue
        options.append(
            {
                "manager_id": manager.id,
                "manager_email": manager.email,
                "goals": [
                    {"id": g.id, "title": g.title, "weightage": g.weightage}
                    for g in goals
                ],
                "subordinates": [
                    {"id": s.id, "email": s.email} for s in subordinates
                ],
            }
        )
    return options


def admin_cascade_kpi(
    db: Session,
    admin_id: int,
    manager_id: int,
    goal_id: int,
    employee_ids: list[int],
) -> dict:
    pushed = []
    skipped = []
    for employee_id in employee_ids:
        try:
            link = push_kpi_to_subordinate(db, manager_id, employee_id, goal_id)
            pushed.append({"employee_id": employee_id, "shared_goal_id": link.id})
        except HTTPException as exc:
            skipped.append({"employee_id": employee_id, "reason": exc.detail})
    log_action(
        db,
        admin_id,
        "ADMIN_CASCADE_KPI",
        f"Goal:{goal_id}->Employees:{employee_ids}",
    )
    return {"pushed": pushed, "skipped": skipped}
