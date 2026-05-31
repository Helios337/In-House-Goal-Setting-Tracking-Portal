from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app import schemas, models, dependencies
from app.core.database import get_db
from app.services.audit_service import log_action

router = APIRouter()


def _format_audit_logs(db: Session, logs: list, total: int, limit: int):
    user_ids = {log.user_id for log in logs if log.user_id is not None}
    users = {
        user.id: user
        for user in db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    } if user_ids else {}

    entries = []
    for log in logs:
        user = users.get(log.user_id)
        entries.append(
            {
                "id": str(log.id),
                "timestamp": log.timestamp.isoformat() if log.timestamp else "",
                "action": log.action,
                "performedBy": user.email if user else "Unknown",
                "details": log.target_resource,
            }
        )
    total_pages = max(1, (total + limit - 1) // limit)
    return {"logs": entries, "totalPages": total_pages}


@router.get("/", response_model=List[schemas.AuditLogOut])
def get_audit_trail(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _admin=Depends(dependencies.require_admin_role),
):
    return (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/logs")
def get_audit_logs_paginated(
    page: int = 1,
    limit: int = 20,
    userId: Optional[int] = None,
    db: Session = Depends(get_db),
    _admin=Depends(dependencies.require_admin_role),
):
    query = db.query(models.AuditLog)
    if userId:
        query = query.filter(models.AuditLog.user_id == userId)

    total = query.count()
    logs = (
        query.order_by(models.AuditLog.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return _format_audit_logs(db, logs, total, limit)
