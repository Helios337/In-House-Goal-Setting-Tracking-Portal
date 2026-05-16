from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class AppException(Exception):
    """Base class for custom application exceptions."""
    def __init__(self, status_code: int, message: str, error_code: str = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code or "APP_ERROR"

class GoalWeightageError(AppException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, message=message, error_code="INVALID_WEIGHTAGE")

class SheetLockedError(AppException):
    def __init__(self, message: str = "This goal sheet is locked and cannot be modified."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message=message, error_code="SHEET_LOCKED")

async def app_exception_handler(request: Request, exc: AppException):
    """Catches custom AppExceptions and formats them uniformly."""
    logger.error(f"AppException: {exc.error_code} - {exc.message} at {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "path": request.url.path
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unhandled server errors."""
    logger.exception(f"Unhandled server error at {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please contact support.",
        }
    )
