from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from . import Base

class ThrustArea(Base):
    """High-level strategic areas for the organization."""
    __tablename__ = 'thrust_areas'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

class GoalSheet(Base):
    """A collection of goals for a specific user in a specific cycle."""
    __tablename__ = 'goal_sheets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    cycle_id = Column(Integer, ForeignKey('checkin_cycles.id'), nullable=False)
    status = Column(String, default="DRAFT")  # DRAFT, SUBMITTED, APPROVED
    
    goals = relationship("Goal", back_populates="goal_sheet")
    checkins = relationship("ManagerCheckin", back_populates="goal_sheet")

class Goal(Base):
    __tablename__ = 'goals'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    weightage = Column(Integer, default=10)
    uom_type = Column(String, nullable=True)
    target_value = Column(Float, nullable=True)
    
    # Foreign Keys
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    goal_sheet_id = Column(Integer, ForeignKey('goal_sheets.id'), nullable=False)
    thrust_area_id = Column(Integer, ForeignKey('thrust_areas.id'), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="goals")
    goal_sheet = relationship("GoalSheet", back_populates="goals")
    shared_with = relationship("SharedGoal", back_populates="goal")
    achievements = relationship("QuarterlyAchievement", back_populates="goal")
