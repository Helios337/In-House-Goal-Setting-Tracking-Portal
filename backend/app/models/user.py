from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # e.g., 'admin', 'manager', 'employee'
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey('roles.id'))

    # Relationships
    role = relationship("Role")
    goals = relationship("Goal", back_populates="owner")
    shared_goals = relationship("SharedGoal", back_populates="user")
    subordinates = relationship("OrgHierarchy", foreign_keys='OrgHierarchy.manager_id', back_populates="manager")

class OrgHierarchy(Base):
    """Represents the reporting structure."""
    __tablename__ = 'org_hierarchy'
    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    employee_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    manager = relationship("User", foreign_keys=[manager_id], back_populates="subordinates")
    employee = relationship("User", foreign_keys=[employee_id])
