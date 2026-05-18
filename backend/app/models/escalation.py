from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from . import Base


class EscalationRecord(Base):
    __tablename__ = "escalation_records"

    id = Column(Integer, primary_key=True, index=True)
    rule_type = Column(String, nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    status = Column(String, default="open")
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
