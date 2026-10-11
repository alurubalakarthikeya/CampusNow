"""Authentication boundary.

Students are identified by a bearer token issued by the campus identity
provider. This module verifies that token and nothing else: it never trusts a
`user_id` from a request body, and it has no bypass.

Two states are possible:

* **Configured** — `AUTH_ISSUER`, `AUTH_AUDIENCE` and `AUTH_JWKS_URL` are
  set, and tokens are verified against the provider's signing keys.
* **Unconfigured** — the deployment has not been given an identity provider.
  Authenticated endpoints then answer 503 and say so. They do not fall back to
  an anonymous or fabricated identity.

`AUTH_DEV_MODE` exists for local work only, is refused when
`APP_ENV=production`, and is never enabled by the test suite.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Callable

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import Settings, get_settings
from .errors import ApiError, UnavailableError

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Student:
    """The authenticated caller. `subject` is the provider's stable user id."""

    subject: str
    email: str | None = None
    display_name: str | None = None
    roles: tuple[str, ...] = ()

    @property
    def is_staff(self) -> bool:
        """Staff-only operations are gated on a provider-supplied role."""
        return any(role in {"operations", "admin", "staff"} for role in self.roles)


class IdentityProvider:
    """Verifies a bearer token and returns the student it belongs to."""

    def verify(self, token: str) -> Student:  # pragma: no cover - interface
        raise NotImplementedError


class JwksIdentityProvider(IdentityProvider):
    """Verifies RS256 tokens against the campus provider's JWKS endpoint."""

    def __init__(self, issuer: str, audience: str, jwks_url: str) -> None:
        self._issuer = issuer
        self._audience = audience
        self._jwks_url = jwks_url

    def verify(self, token: str) -> Student:
        try:
            header = jwt.get_unverified_header(token)
            key = jwt.PyJWKClient(self._jwks_url).get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token,
                key,
                algorithms=[header.get("alg", "RS256")],
                audience=self._audience,
                issuer=self._issuer,
                options={"require": ["exp", "iat", "sub"]},
            )
        except jwt.PyJWTError as exc:
            raise ApiError(401, "UNAUTHENTICATED", "Sign in again to continue.") from exc

        roles = claims.get("roles") or claims.get("scope") or ()
        if isinstance(roles, str):
            roles = roles.split()

        return Student(
            subject=str(claims["sub"]),
            email=claims.get("email"),
            display_name=claims.get("name"),
            roles=tuple(str(role) for role in roles),
        )


class DevIdentityProvider(IdentityProvider):
    """Development-only fixed token. Never reachable in production."""

    def __init__(self, token: str) -> None:
        self._token = token

    def verify(self, token: str) -> Student:
        if token != self._token:
            raise ApiError(401, "UNAUTHENTICATED", "Sign in again to continue.")
        return Student(subject="dev-student", email="dev@campus.edu", display_name="Dev Student")


@lru_cache
def _provider() -> IdentityProvider | None:
    settings = get_settings()
    if settings.auth_configured:
        return JwksIdentityProvider(
            issuer=settings.auth_issuer or "",
            audience=settings.auth_audience or "",
            jwks_url=settings.auth_jwks_url or "",
        )
    if settings.auth_dev_mode and settings.auth_dev_token:
        return DevIdentityProvider(settings.auth_dev_token)
    return None


def get_current_student(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Student:
    """FastAPI dependency: the authenticated student, or a clear refusal.

    Tests override this dependency with an explicit fixture identity; there is
    deliberately no environment flag that turns it off.
    """
    settings: Settings = get_settings()
    provider = _provider()

    if provider is None:
        raise UnavailableError(
            "Authentication is not configured on this server. Set AUTH_ISSUER, "
            "AUTH_AUDIENCE and AUTH_JWKS_URL."
        )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise ApiError(401, "UNAUTHENTICATED", "Sign in again to continue.")

    student = provider.verify(credentials.credentials)
    request.state.student_id = student.subject
    return student


def require_staff(student: Student = Depends(get_current_student)) -> Student:
    """Dependency for operations-only endpoints (none are public yet)."""
    if not student.is_staff:
        raise ApiError(403, "FORBIDDEN", "This account is not allowed to do that.")
    return student


StudentDependency = Callable[..., Student]
