from sqlalchemy.orm import Session
from app import models

def log_action(db: Session, user_id: int, action: str, target_resource: str):
    """
    Intercepts and records business events.
    Called explicitly by other services whenever state changes.
    """
    audit_entry = models.AuditLog(
        user_id=user_id,
        action=action,
        target_resource=target_resource
    )
    db.add(audit_entry)
    db.commit()
    # We do not return the object because audit logging should be a fire-and-forget 
    # internal trace, not a response payload.
