import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.database import SessionLocal
from app.routers import api_router
from app.services.escalation_service import run_escalation_checks

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def _run_escalations():
    db = SessionLocal()
    try:
        count = run_escalation_checks(db)
        if count:
            logger.info("Escalation check created %s records", count)
    except Exception as exc:
        logger.error("Escalation check failed: %s", exc)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(_run_escalations, "interval", hours=1, id="escalation_checks")
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
