"""Error handling.

Clients receive a stable, boring envelope — a code, a message safe to show a
student, and a request identifier for support. Stack traces, database errors
and provider responses stay in the server log.
"""

from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("campusnow.errors")


class ApiError(Exception):
    """A failure this API understands and can describe."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


class NotFoundError(ApiError):
    def __init__(self, message: str = "That record is no longer available.") -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, "NOT_FOUND", message)


class ForbiddenError(ApiError):
    def __init__(self, message: str = "This account is not allowed to do that.") -> None:
        super().__init__(status.HTTP_403_FORBIDDEN, "FORBIDDEN", message)


class ConflictError(ApiError):
    def __init__(self, message: str) -> None:
        super().__init__(status.HTTP_409_CONFLICT, "CONFLICT", message)


class UnavailableError(ApiError):
    """A dependency the deployment has not configured yet."""

    def __init__(self, message: str) -> None:
        super().__init__(status.HTTP_503_SERVICE_UNAVAILABLE, "UNAVAILABLE", message)


def _envelope(code: str, message: str, request_id: str, details: object | None = None) -> dict:
    payload: dict[str, object] = {"error": {"code": code, "message": message, "request_id": request_id}}
    if details is not None:
        payload["error"]["details"] = details  # type: ignore[index]
    return payload


def install_error_handlers(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request.state.request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        # Field names and reasons only: the submitted values are not echoed.
        details = [
            {"field": ".".join(str(part) for part in error.get("loc", ())), "reason": error.get("msg")}
            for error in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_envelope(
                "VALIDATION_ERROR",
                "Some fields were rejected. Check the request and try again.",
                getattr(request.state, "request_id", ""),
                details,
            ),
        )

    @app.exception_handler(ApiError)
    async def api_error_handler(request: Request, exc: ApiError):
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(exc.code, exc.message, getattr(request.state, "request_id", "")),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(request: Request, exc: StarletteHTTPException):
        code = {401: "UNAUTHENTICATED", 403: "FORBIDDEN", 404: "NOT_FOUND", 405: "NOT_FOUND"}.get(
            exc.status_code, "UNKNOWN_ERROR"
        )
        message = {
            401: "Sign in again to continue.",
            403: "This account is not allowed to do that.",
            404: "That record is no longer available.",
            405: "That method is not allowed here.",
        }.get(exc.status_code, "Something went wrong.")
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(code, message, getattr(request.state, "request_id", "")),
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", "")
        # The log gets the detail; the client gets an identifier to quote.
        logger.exception("unhandled error request_id=%s", request_id)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_envelope("SERVER_ERROR", "The campus service had a problem.", request_id),
        )
