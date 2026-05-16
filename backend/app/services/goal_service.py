from sqlalchemy.orm import Session
from app import models

def log_action(db: Session, user_id: int, action: str, target_resource: str):
    """Utility to record events in the AuditLog."""
    log_entry = models.AuditLog(
        user_id=user_id,
        action=action,
        target_resource=target_resource
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
