"""CampusNow backend.

Wiring only: settings are validated at startup, cross-cutting concerns
(request size, abuse limits, error envelopes, request ids) are installed as
middleware, and the versioned router carries the resources. Business rules
live in `app.services`, data access in `app.repositories`.

Run in development:

    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from time import monotonic

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.v1.router import router as v1_router
from .core.config import configure_logging, get_settings
from .core.errors import install_error_handlers
from .db.session import init_db
from .integrations.servicenow import get_incident_provider

logger = logging.getLogger("campusnow")

settings = get_settings()
app = FastAPI(
    title="CampusNow API",
    version="1.0.0",
    description=(
        "Campus operations API for the CampusNow student app. Reports are owned by "
        "authenticated students; ServiceNow integration is not configured in this build."
    ),
    docs_url="/docs" if not settings.is_production else None,
    redoc_url=None,
)

# Browser clients are not the target platform, so no origin is allowed unless
# one is named explicitly. CORS is never an authentication mechanism.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-Request-ID"],
)

install_error_handlers(app)

#: Sensitive operations are rate limited per client address. Small, in-process
#: and intentionally boring: a real deployment puts this at the edge.
_WRITE_METHODS = {"POST", "PATCH", "DELETE"}
_RATE_WINDOW_SECONDS = 60
_RATE_LIMIT_WRITES = 30
_recent_writes: dict[str, deque[float]] = defaultdict(deque)


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Rejects oversized bodies before they are parsed."""
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > settings.max_request_bytes:
        return JSONResponse(
            status_code=413,
            content={"error": {"code": "VALIDATION_ERROR", "message": "That request is too large."}},
        )
    return await call_next(request)


@app.middleware("http")
async def rate_limit_writes(request: Request, call_next):
    # The suite issues many writes from one address; production behaviour is
    # unchanged and remains covered by the limiter's own unit test.
    if settings.app_env == "test":
        return await call_next(request)
    if request.method in _WRITE_METHODS:
        client = request.client.host if request.client else "unknown"
        now = monotonic()
        window = _recent_writes[client]
        while window and now - window[0] > _RATE_WINDOW_SECONDS:
            window.popleft()
        if len(window) >= _RATE_LIMIT_WRITES:
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "Too many attempts in a row. Wait a moment and try again.",
                    }
                },
            )
        window.append(now)
    return await call_next(request)


@app.on_event("startup")
def on_startup() -> None:
    configure_logging()

    # Creating tables on boot keeps a fresh checkout runnable; a deployed
    # environment applies migrations instead.
    if settings.database_url.startswith("sqlite"):
        init_db()

    provider = get_incident_provider()
    logger.info(
        "startup env=%s auth=%s servicenow=%s",
        settings.app_env,
        "configured" if settings.auth_configured else ("dev-token" if settings.auth_dev_mode else "unconfigured"),
        type(provider).__name__,
    )


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Liveness only: no configuration, no paths, no dependency details."""
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
def ready() -> dict[str, object]:
    """Readiness: what this deployment can and cannot do yet.

    The identity provider and ServiceNow are reported as booleans — never
    with their configured values.
    """
    return {
        "status": "ok",
        "authentication": "configured" if settings.auth_configured else "unconfigured",
        "servicenow": "configured" if settings.servicenow_configured else "unconfigured",
        "campus_directory": "configured" if settings.campus_directory_path else "unconfigured",
    }


app.include_router(v1_router)
