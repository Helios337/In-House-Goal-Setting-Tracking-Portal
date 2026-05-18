from sqlalchemy.orm import declarative_base

# 1. Define the Base class
Base = declarative_base()

# 2. Import all models here so they are registered with Base.metadata
from .user import User, Role, OrgHierarchy
from .cycle import CheckinCycle, PhaseWindow
from .goal import Goal, GoalSheet, ThrustArea
from .shared_goal import SharedGoal
from .achievement import QuarterlyAchievement
from .checkin import ManagerCheckin, Comment
from .audit_log import AuditLog
from .notification import Notification
from .escalation import EscalationRecord
