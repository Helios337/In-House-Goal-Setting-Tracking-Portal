from fastapi import APIRouter

from .auth import router as auth_router
from .goals import router as goals_router
from .achievements import router as achievements_router
from .checkins import router as checkins_router
from .shared_goals import router as shared_goals_router
from .users import router as users_router
from .cycles import router as cycles_router
from .reports import router as reports_router
from .audit import router as audit_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(cycles_router, prefix="/cycles", tags=["Cycles"])
api_router.include_router(goals_router, prefix="/goals", tags=["Goals"])
api_router.include_router(shared_goals_router, prefix="/shared-goals", tags=["Shared Goals"])
api_router.include_router(achievements_router, prefix="/achievements", tags=["Achievements"])
api_router.include_router(checkins_router, prefix="/checkins", tags=["Manager Check-ins"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(audit_router, prefix="/audit", tags=["Audit Log"])
