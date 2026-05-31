"""Centralized HTTP exception handlers — never leak stack traces or DB details to clients."""

import logging

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


def _client_path(request: Request) -> str:
    return str(request.url.path)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(
        "AppException %s at %s: %s",
        exc.error_code,
        _client_path(request),
        exc.message,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "path": _client_path(request),
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Normalize FastAPI/HTTPException without exposing internal detail strings from 500s."""
    detail = exc.detail
    if isinstance(detail, list):
        message = "Validation failed"
        errors = detail
    elif isinstance(detail, dict):
        message = detail.get("message", "Request failed")
        errors = detail
    else:
        message = str(detail) if detail else "Request failed"
        errors = None

    if exc.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        logger.exception("HTTP %s at %s", exc.status_code, _client_path(request))
        message = "An unexpected error occurred. Please contact support."

    content: dict = {
        "error": "HTTP_ERROR",
        "message": message,
        "path": _client_path(request),
    }
    if errors is not None and exc.status_code < status.HTTP_500_INTERNAL_SERVER_ERROR:
        content["errors"] = errors

    return JSONResponse(status_code=exc.status_code, content=content)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.info("Validation error at %s", _client_path(request))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Invalid request payload",
            "path": _client_path(request),
            "errors": exc.errors(),
        },
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    logger.exception("Database error at %s", _client_path(request))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "DATABASE_ERROR",
            "message": "A database error occurred. Please try again later.",
            "path": _client_path(request),
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, JWTError):
        logger.warning("JWT error at %s", _client_path(request))
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "INVALID_TOKEN",
                "message": "Could not validate credentials",
                "path": _client_path(request),
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.exception("Unhandled error at %s", _client_path(request))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please contact support.",
            "path": _client_path(request),
        },
    )


def register_exception_handlers(app) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
