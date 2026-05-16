from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from . import Base

class ManagerCheckin(Base):
    """A record of a manager reviewing a goal sheet."""
    __tablename__ = 'manager_checkins'
    id = Column(Integer, primary_key=True, index=True)
    goal_sheet_id = Column(Integer, ForeignKey('goal_sheets.id'), nullable=False)
    manager_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    status = Column(String, nullable=False)  # e.g., PENDING, COMPLETED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    goal_sheet = relationship("GoalSheet", back_populates="checkins")
    comments = relationship("Comment", back_populates="checkin")

class Comment(Base):
    """Comments left during a check-in."""
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True, index=True)
    checkin_id = Column(Integer, ForeignKey('manager_checkins.id'), nullable=False)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    checkin = relationship("ManagerCheckin", back_populates="comments")
