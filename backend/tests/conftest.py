"""Test fixtures.

Authentication in tests is provided by overriding FastAPI's dependency with a
fixture identity — the same mechanism any deployment would use to swap in a
different identity provider. There is no production bypass flag involved, and
two distinct identities are available so ownership isolation can be tested.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest
from fastapi import Request
from fastapi.testclient import TestClient

# Configuration must exist before the application imports its settings.
_TMP_DIR = Path(tempfile.mkdtemp(prefix="campusnow-tests-"))
os.environ.update(
    {
        "APP_ENV": "test",
        "DATABASE_URL": f"sqlite:///{(_TMP_DIR / 'test.db').as_posix()}",
        "AUTH_ISSUER": "",
        "AUTH_AUDIENCE": "",
        "AUTH_JWKS_URL": "",
        "AUTH_DEV_MODE": "false",
        "AUTH_DEV_TOKEN": "",
    }
)

from app.core.config import get_settings  # noqa: E402
from app.core.errors import ApiError  # noqa: E402
from app.core.security import Student, get_current_student  # noqa: E402
from app.db.session import Base, get_db, get_engine, get_session_factory, reset_engine  # noqa: E402
from app.main import app  # noqa: E402

STUDENT_A = Student(subject="student-a", email="a@campus.edu", display_name="Student A")
STUDENT_B = Student(subject="student-b", email="b@campus.edu", display_name="Student B")


@pytest.fixture(autouse=True)
def fresh_database():
    reset_engine()
    get_settings.cache_clear()
    Base.metadata.drop_all(bind=get_engine())
    Base.metadata.create_all(bind=get_engine())
    yield
    Base.metadata.drop_all(bind=get_engine())
    reset_engine()


def _identity_from_header(request: Request) -> Student:
    """Resolves the fixture identity from a per-client header.

    A single override is installed for the whole app, so two TestClients can
    each act as a different student in the same test. The header is test-only
    plumbing: it never reaches `get_current_student`'s real implementation and
    is not a deployment bypass.
    """
    subject = request.headers.get("x-test-student", "")
    for student in (STUDENT_A, STUDENT_B):
        if student.subject == subject:
            return student
    raise ApiError(401, "UNAUTHENTICATED", "Sign in again to continue.")


def _client_for(student: Student) -> TestClient:
    app.dependency_overrides[get_current_student] = _identity_from_header
    # Each client carries its own identity on every request, so overriding a
    # shared dependency cannot make one client impersonate the other.
    return TestClient(app, headers={"x-test-student": student.subject})


@pytest.fixture
def client() -> TestClient:
    """A signed-in student with a clean database."""
    with _client_for(STUDENT_A) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def other_client() -> TestClient:
    """A second, unrelated student, used to prove ownership isolation."""
    with _client_for(STUDENT_B) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def anonymous_client() -> TestClient:
    """No authentication override: the deployment's own auth applies."""
    app.dependency_overrides.pop(get_current_student, None)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def report_payload() -> dict:
    return {
        "title": "No WiFi in the library reading room",
        "description": "Drops every few minutes since the morning lecture.",
        "category": "wifi",
        "severity": "medium",
        "impact": "medium",
        "urgency": "medium",
        "location": {
            "building_id": "library",
            "building_name": "Library",
            "floor": "Ground",
            "room": "B204",
            "label": "Library · Ground · B204",
        },
        "affected_students": 4,
    }


@pytest.fixture
def session_factory():
    return get_session_factory()


__all__ = ["STUDENT_A", "STUDENT_B", "session_factory", "get_db"]
