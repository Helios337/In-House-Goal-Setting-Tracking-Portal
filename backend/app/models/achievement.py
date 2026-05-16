from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from . import Base

class QuarterlyAchievement(Base):
    """Tracks progress on a specific goal for a given quarter."""
    __tablename__ = 'quarterly_achievements'
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey('goals.id'), nullable=False)
    
    quarter = Column(String, nullable=False)  # e.g., 'Q1', 'Q2'
    progress_percentage = Column(Float, default=0.0)
    narrative = Column(Text, nullable=True)  # User's write-up of their achievement

    goal = relationship("Goal", back_populates="achievements")
