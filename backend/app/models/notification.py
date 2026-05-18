from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from . import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    resource_type = Column(String, nullable=True)
    resource_id = Column(Integer, nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    delivery_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
