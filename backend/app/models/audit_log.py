from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from . import Base

class AuditLog(Base):
    """Immutable ledger of who did what and when."""
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    action = Column(String, nullable=False)  # e.g., 'UPDATE_GOAL', 'APPROVE_SHEET'
    target_resource = Column(String, nullable=False)  # e.g., 'Goal:42'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
