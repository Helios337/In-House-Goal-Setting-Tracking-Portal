from fastapi import status


class AppException(Exception):
    """Base class for custom application exceptions."""

    def __init__(self, status_code: int, message: str, error_code: str | None = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code or "APP_ERROR"


class GoalWeightageError(AppException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code="INVALID_WEIGHTAGE",
        )


class SheetLockedError(AppException):
    def __init__(self, message: str = "This goal sheet is locked and cannot be modified."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code="SHEET_LOCKED",
        )
