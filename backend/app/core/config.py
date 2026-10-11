"""Application configuration.

Everything the backend needs is read from the environment once, validated at
startup, and never echoed back to a client. When a piece of configuration is
missing — the identity provider, for example — the affected endpoints say so
plainly instead of falling back to a bypass.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend settings. Names match `backend/.env.example`."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    database_url: str = "sqlite:///./campusnow.db"

    #: Optional campus directory document (blocks and teams). Unset means the
    #: locations endpoint reports an unconfigured source rather than inventing
    #: campus data.
    campus_directory_path: str | None = None

    # Identity provider (issuer of student bearer tokens).
    auth_issuer: str | None = None
    auth_audience: str | None = None
    auth_jwks_url: str | None = None

    # Development-only fixed token. Refused in production.
    auth_dev_mode: bool = False
    auth_dev_token: str | None = None

    # ServiceNow is a later phase. Empty values keep the adapter unconfigured.
    servicenow_instance_url: str | None = None
    servicenow_client_id: str | None = None
    servicenow_client_secret: str | None = None
    servicenow_assignment_group: str | None = None

    #: Requests larger than this are rejected before parsing.
    max_request_bytes: int = Field(default=64 * 1024, ge=1024)

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def auth_configured(self) -> bool:
        return bool(self.auth_issuer and self.auth_audience and self.auth_jwks_url)

    @property
    def servicenow_configured(self) -> bool:
        return bool(
            self.servicenow_instance_url
            and self.servicenow_client_id
            and self.servicenow_client_secret
        )

    @model_validator(mode="after")
    def _refuse_unsafe_combinations(self) -> "Settings":
        # A development shortcut must never be able to run in production.
        if self.is_production and self.auth_dev_mode:
            raise ValueError("AUTH_DEV_MODE cannot be enabled when APP_ENV=production")
        if self.auth_dev_mode and not self.auth_dev_token:
            raise ValueError("AUTH_DEV_MODE requires AUTH_DEV_TOKEN")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


def configure_logging() -> None:
    """Structured-enough logging that never includes credentials or bodies."""
    logging.basicConfig(
        level=logging.INFO if not get_settings().is_production else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
