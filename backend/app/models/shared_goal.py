from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class SharedGoal(Base):
    """Link table for sharing goals with viewers or collaborators."""
    __tablename__ = 'shared_goals'
    
    # Composite primary key
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    goal_id = Column(Integer, ForeignKey('goals.id'), primary_key=True)
    
    permission_level = Column(String, default="VIEWER")  # e.g., VIEWER, CONTRIBUTOR

    # Relationships
    user = relationship("User", back_populates="shared_goals")
    goal = relationship("Goal", back_populates="shared_with")
