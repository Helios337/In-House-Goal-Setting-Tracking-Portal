from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class CheckinCycle(Base):
    """The overarching performance period (e.g., FY24, H1 2024)."""
    __tablename__ = 'checkin_cycles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)

    phases = relationship("PhaseWindow", back_populates="cycle")

class PhaseWindow(Base):
    """Specific active windows within a cycle (e.g., Goal Setting phase)."""
    __tablename__ = 'phase_windows'
    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey('checkin_cycles.id'), nullable=False)
    name = Column(String, nullable=False)  # e.g., 'Goal Setting', 'Mid-Year Review'
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)

    cycle = relationship("CheckinCycle", back_populates="phases")
