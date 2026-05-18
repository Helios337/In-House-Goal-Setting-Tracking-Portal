import logging
from typing import Optional

import httpx
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.events.types import DomainEvent, channel_user
from app.services.event_bus import publish

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    *,
    user_id: int,
    type: str,
    title: str,
    body: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    actor_id: Optional[int] = None,
    publish_event: bool = True,
    background_tasks: Optional[BackgroundTasks] = None,
    send_external: bool = False,
) -> models.Notification:
    notification = models.Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        resource_type=resource_type,
        resource_id=resource_id,
        delivery_status="pending",
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    if publish_event:
        publish(
            DomainEvent(
                type="notification.created",
                channels=[channel_user(user_id)],
                actor_id=actor_id,
                resource_type="notification",
                resource_id=notification.id,
                payload={
                    "title": title,
                    "body": body,
                    "notification_type": type,
                },
            )
        )

    if send_external and background_tasks:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            background_tasks.add_task(
                deliver_notification_task, notification.id, user.email
            )

    return notification


def send_email_notification(to_email: str, subject: str, body: str) -> bool:
    if settings.EMAIL_PROVIDER == "sendgrid" and settings.SENDGRID_API_KEY:
        try:
            response = httpx.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": settings.EMAIL_FROM},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body}],
                },
                timeout=10.0,
            )
            return response.status_code in (200, 202)
        except httpx.HTTPError as exc:
            logger.error("SendGrid email failed: %s", exc)
            return False

    logger.info("EMAIL (stub) TO: %s | SUBJECT: %s", to_email, subject)
    return True


def send_teams_webhook(webhook_url: str, message: str) -> bool:
    if not webhook_url:
        logger.info("TEAMS (stub): %s", message)
        return True
    try:
        response = httpx.post(
            webhook_url,
            json={"text": message},
            timeout=10.0,
        )
        return response.status_code == 200
    except httpx.HTTPError as exc:
        logger.error("Teams webhook failed: %s", exc)
        return False


def deliver_notification_task(
    notification_id: int,
    user_email: str,
    teams_webhook: Optional[str] = None,
) -> None:
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        _deliver_notification(db, notification_id, user_email, teams_webhook)
    finally:
        db.close()


def _deliver_notification(
    db: Session,
    notification_id: int,
    user_email: str,
    teams_webhook: Optional[str] = None,
) -> None:
    notification = (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id)
        .first()
    )
    if not notification:
        return

    email_ok = send_email_notification(
        user_email, notification.title, notification.body or ""
    )
    teams_ok = send_teams_webhook(
        teams_webhook or settings.TEAMS_WEBHOOK_URL or "",
        f"{notification.title}\n{notification.body or ''}",
    )

    notification.delivery_status = (
        "sent" if email_ok or teams_ok else "failed"
    )
    db.commit()


def notify_manager_sheet_submitted(
    db: Session,
    background_tasks: BackgroundTasks,
    manager_id: int,
    manager_email: str,
    employee_name: str,
    sheet_id: int,
    actor_id: int,
) -> models.Notification:
    notification = create_notification(
        db,
        user_id=manager_id,
        type="goal.sheet.submitted",
        title=f"Action required: {employee_name} submitted goals",
        body=f"Please review and approve goal sheet #{sheet_id}.",
        resource_type="goal_sheet",
        resource_id=sheet_id,
        actor_id=actor_id,
    )
    background_tasks.add_task(
        deliver_notification_task,
        notification.id,
        manager_email,
    )
    return notification
