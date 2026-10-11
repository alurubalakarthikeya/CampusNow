"""ServiceNow boundary and configuration guards.

These tests matter more than they look: they are the ones that fail if someone
later replaces the unconfigured adapter with something that reports success
without talking to ServiceNow, or turns the development auth shortcut on in
production.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.errors import UnavailableError
from app.integrations.servicenow import (
    FIELD_MAP,
    UnconfiguredServiceNowAdapter,
    get_incident_provider,
)


def test_unconfigured_adapter_refuses_instead_of_inventing_an_incident():
    adapter = UnconfiguredServiceNowAdapter(["SERVICENOW_INSTANCE_URL"])

    with pytest.raises(UnavailableError) as excinfo:
        adapter.create_incident({"short_description": "no wifi"})

    assert "not configured" in str(excinfo.value)
    assert "SERVICENOW_INSTANCE_URL" in str(excinfo.value)


def test_unconfigured_adapter_never_returns_an_incident():
    adapter = UnconfiguredServiceNowAdapter([])
    for call in (
        lambda: adapter.get_incident("abc"),
        lambda: adapter.list_incidents_for_student("student-a"),
    ):
        with pytest.raises(UnavailableError):
            call()


def test_provider_factory_reports_the_missing_configuration():
    provider = get_incident_provider()
    assert isinstance(provider, UnconfiguredServiceNowAdapter)


def test_field_map_keeps_servicenow_vocabulary_on_the_server():
    assert FIELD_MAP["title"] == "short_description"
    assert all(isinstance(field, str) and field for field in FIELD_MAP.values())


def test_production_refuses_the_development_auth_shortcut():
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            auth_dev_mode=True,
            auth_dev_token="dev-token",
            _env_file=None,
        )


def test_development_shortcut_requires_a_token():
    with pytest.raises(ValidationError):
        Settings(app_env="development", auth_dev_mode=True, auth_dev_token="", _env_file=None)


def test_settings_report_configuration_without_exposing_values():
    settings = Settings(app_env="development", _env_file=None)
    assert settings.auth_configured is False
    assert settings.servicenow_configured is False
