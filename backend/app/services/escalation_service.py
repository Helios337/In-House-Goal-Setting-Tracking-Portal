import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.events.types import DomainEvent, channel_user
from app.services.event_bus import publish
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)


def run_escalation_checks(db: Session) -> int:
    """Run all escalation rules. Returns count of new escalations."""
    count = 0
    count += _escalate_pending_approvals(db)
    count += _escalate_incomplete_achievements(db)
    return count


def _escalate_pending_approvals(db: Session) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.ESCALATION_SHEET_HOURS)
    sheets = (
        db.query(models.GoalSheet)
        .filter(models.GoalSheet.status == "SUBMITTED")
        .all()
    )
    created = 0
    for sheet in sheets:
        existing = (
            db.query(models.EscalationRecord)
            .filter_by(
                rule_type="sheet_approval_overdue",
                resource_type="goal_sheet",
                resource_id=sheet.id,
                status="open",
            )
            .first()
        )
        if existing:
            continue

        from app.services.goal_service import _get_manager_for_employee

        manager = _get_manager_for_employee(db, sheet.user_id)
        if not manager:
            continue

        escalation = models.EscalationRecord(
            rule_type="sheet_approval_overdue",
            target_user_id=manager.id,
            resource_type="goal_sheet",
            resource_id=sheet.id,
            details=f"Goal sheet #{sheet.id} pending approval beyond {settings.ESCALATION_SHEET_HOURS}h",
        )
        db.add(escalation)
        db.commit()
        created += 1

        notification = create_notification(
            db,
            user_id=manager.id,
            type="escalation.sheet_approval",
            title="Escalation: overdue goal approval",
            body=escalation.details,
            resource_type="goal_sheet",
            resource_id=sheet.id,
        )
        from app.services.notification_service import deliver_notification_task

        deliver_notification_task(notification.id, manager.email)

        publish(
            DomainEvent(
                type="escalation.created",
                channels=[channel_user(manager.id)],
                resource_type="escalation",
                resource_id=escalation.id,
                payload={"rule": "sheet_approval_overdue"},
            )
        )
    return created


def _escalate_incomplete_achievements(db: Session) -> int:
    created = 0
    employees = db.query(models.User).filter(models.User.is_active == True).all()
    for employee in employees:
        sheet = (
            db.query(models.GoalSheet)
            .filter_by(user_id=employee.id, status="APPROVED")
            .first()
        )
        if not sheet:
            continue

        goals = db.query(models.Goal).filter(models.Goal.goal_sheet_id == sheet.id).all()
        for goal in goals:
            achievement = (
                db.query(models.QuarterlyAchievement)
                .filter_by(goal_id=goal.id, quarter="Q1")
                .first()
            )
            if achievement and achievement.progress_percentage > 0:
                continue

            existing = (
                db.query(models.EscalationRecord)
                .filter_by(
                    rule_type="achievement_incomplete",
                    resource_type="goal",
                    resource_id=goal.id,
                    status="open",
                )
                .first()
            )
            if existing:
                continue

            escalation = models.EscalationRecord(
                rule_type="achievement_incomplete",
                target_user_id=employee.id,
                resource_type="goal",
                resource_id=goal.id,
                details=f"Quarterly achievement incomplete for goal #{goal.id}",
            )
            db.add(escalation)
            db.commit()
            created += 1

            create_notification(
                db,
                user_id=employee.id,
                type="escalation.achievement",
                title="Reminder: complete quarterly update",
                body=escalation.details,
                resource_type="goal",
                resource_id=goal.id,
            )
    return created
