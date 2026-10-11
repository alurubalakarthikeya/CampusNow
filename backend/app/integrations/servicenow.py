"""ServiceNow integration boundary.

This is the seam the later ServiceNow phase plugs into. Nothing here talks to
ServiceNow yet: the only adapter available is explicitly unconfigured, and it
raises rather than pretending an incident was created. The mobile app never
sees ServiceNow credentials, field mappings or instance URLs — only the
records this backend owns.

What the next phase adds:

* `ServiceNowRestAdapter`, implementing the methods below against
  `SERVICENOW_INSTANCE_URL` with OAuth credentials held on the server.
* A background job (or an outbox) that calls `create_incident` for reports
  that are saved but not yet mirrored, with the report id as the idempotency
  key so a retry cannot open two incidents.
* A bidirectional status mapping, so `sys_id` and ServiceNow state changes
  flow back into `ReportService.transition`.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from ..core.config import get_settings
from ..core.errors import UnavailableError

#: Where the report's fields land on the ServiceNow incident table. Kept here
#: so no screen and no route knows ServiceNow's vocabulary.
FIELD_MAP: dict[str, str] = {
    "title": "short_description",
    "description": "description",
    "category": "category",
    "location_label": "cmdb_ci",
    "impact": "impact",
    "urgency": "urgency",
    "priority": "priority",
    "student_reference": "caller_id",
}


@dataclass(frozen=True)
class IncidentResult:
    sys_id: str
    number: str


class IncidentProvider(Protocol):
    """What the backend needs from an incident system."""

    def create_incident(self, payload: dict[str, Any]) -> IncidentResult: ...

    def get_incident(self, sys_id: str) -> dict[str, Any]: ...

    def list_incidents_for_student(self, student_reference: str) -> list[dict[str, Any]]: ...


class UnconfiguredServiceNowAdapter:
    """The default adapter: present, documented, and honest about being off.

    It never returns a fabricated `IncidentResult`; every call raises, so no
    code path can report a report as synchronised when it is not.
    """

    def __init__(self, missing: list[str]) -> None:
        self._missing = missing

    def _fail(self) -> None:
        raise UnavailableError(
            "The ServiceNow integration is not configured on this server. "
            f"Missing configuration: {', '.join(self._missing)}."
        )

    def create_incident(self, payload: dict[str, Any]) -> IncidentResult:
        self._fail()
        raise AssertionError("unreachable")  # keeps type checkers happy

    def get_incident(self, sys_id: str) -> dict[str, Any]:
        self._fail()
        raise AssertionError("unreachable")

    def list_incidents_for_student(self, student_reference: str) -> list[dict[str, Any]]:
        self._fail()
        raise AssertionError("unreachable")


def get_incident_provider() -> IncidentProvider:
    """Returns the adapter for this deployment.

    While ServiceNow is unconfigured — which is the case for every
    environment today — this returns the adapter above, so a caller finds out
    immediately instead of receiving invented data.
    """
    settings = get_settings()
    missing = [
        name
        for name, value in (
            ("SERVICENOW_INSTANCE_URL", settings.servicenow_instance_url),
            ("SERVICENOW_CLIENT_ID", settings.servicenow_client_id),
            ("SERVICENOW_CLIENT_SECRET", settings.servicenow_client_secret),
        )
        if not value
    ]
    return UnconfiguredServiceNowAdapter(missing)
