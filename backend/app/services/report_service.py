"""Report business rules.

The rules live here, not in the route handlers: who may create what, which
edits are permitted and when, which status changes are legal, and what the
campus pulse is computed from. Routes deal with transport; this layer decides
what is allowed.
"""

from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.errors import ConflictError, ForbiddenError, NotFoundError, UnavailableError
from ..db.session import ReportRecord
from ..repositories.report_repository import Page, SqlReportRepository
from ..schemas.report import LocationPayload, ReportCreate, ReportUpdate

logger = logging.getLogger("campusnow.reports")

#: The lifecycle. Only operations changes a status, and only along these edges.
STATUS_TRANSITIONS: dict[str, set[str]] = {
    "reported": {"confirmed"},
    "confirmed": {"assigned"},
    "assigned": {"investigating"},
    "investigating": {"resolved"},
    "resolved": {"investigating"},
}

#: Statuses a student may still edit or withdraw.
STUDENT_EDITABLE_STATUSES = {"reported"}

PRIORITY_MATRIX: dict[str, dict[str, int]] = {
    "high": {"high": 1, "medium": 2, "low": 3},
    "medium": {"high": 2, "medium": 3, "low": 4},
    "low": {"high": 3, "medium": 4, "low": 4},
}


def service_now_priority(impact: str, urgency: str) -> int:
    return PRIORITY_MATRIX[impact][urgency]


def _campus_directory() -> list[dict[str, Any]] | None:
    """The campus's own directory, when one has been configured."""
    settings = get_settings()
    if not settings.campus_directory_path:
        return None
    path = Path(settings.campus_directory_path)
    if not path.exists():
        logger.warning("campus directory path does not exist; locations unconfigured")
        return None
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        logger.warning("campus directory could not be read; locations unconfigured")
        return None
    buildings = document.get("buildings") if isinstance(document, dict) else None
    return buildings if isinstance(buildings, list) else None


class ReportService:
    def __init__(self, session: Session) -> None:
        self._repository = SqlReportRepository(session)

    # -- creation ---------------------------------------------------------

    def create(self, student_id: str, payload: ReportCreate, idempotency_key: str | None) -> tuple[ReportRecord, bool]:
        """Creates a report, or returns the one a retry already created.

        The second element of the tuple is True when this call created the
        record, and False when the same `Idempotency-Key` was replayed.
        """
        if idempotency_key:
            existing = self._repository.find_by_idempotency_key(student_id, idempotency_key)
            if existing is not None:
                return existing, False

        self._validate_location(payload.location)

        title = (payload.title or "").strip()
        if not title:
            # A summary is the one field operations reads first, so it falls
            # back to the category rather than being invented from nothing.
            title = f"{payload.category.capitalize()} problem"

        record = ReportRecord(
            id=f"r-{uuid.uuid4().hex[:16]}",
            student_id=student_id,
            idempotency_key=idempotency_key,
            title=title[:120],
            description=payload.description,
            category=payload.category,
            severity=payload.severity,
            impact=payload.impact,
            urgency=payload.urgency,
            priority=service_now_priority(payload.impact, payload.urgency),
            building_id=payload.location.building_id,
            building_name=payload.location.building_name,
            floor=payload.location.floor,
            room=payload.location.room,
            status="reported",
        )

        created = self._repository.create(record)
        self._repository.add_event(created.id, "reported", "Report submitted")
        return self._repository.get(created.id) or created, True

    def _validate_location(self, location: LocationPayload) -> None:
        directory = _campus_directory()
        if directory is None:
            # No directory configured: the campus has not been described to
            # this deployment yet. The value is accepted and recorded as sent
            # rather than being silently rewritten.
            return
        known = {
            str(building.get("id"))
            for building in directory
            if isinstance(building, dict) and building.get("id")
        }
        if known and location.building_id not in known:
            raise ConflictError("That block is not part of the campus directory.")

    # -- reads ------------------------------------------------------------

    def list_reports(self, student_id: str, page: int, page_size: int) -> Page:
        return self._repository.list_for_student(student_id, page, page_size)

    def get_report(self, student_id: str, report_id: str) -> ReportRecord:
        """Returns the report, or 404.

        A record owned by another student produces the same 404 as a record
        that does not exist: whether someone else's report exists is not a
        question this API answers.
        """
        record = self._repository.get(report_id)
        if record is None or record.student_id != student_id:
            raise NotFoundError()
        return record

    # -- changes ----------------------------------------------------------

    def update_report(self, student_id: str, report_id: str, patch: ReportUpdate) -> ReportRecord:
        record = self.get_report(student_id, report_id)

        if record.servicenow_sys_id:
            raise ForbiddenError("This report is with campus operations and can no longer be edited here.")
        if record.status not in STUDENT_EDITABLE_STATUSES:
            raise ForbiddenError("Operations has already picked this report up, so it cannot be edited here.")

        if patch.title is not None:
            cleaned = patch.title.strip()
            if cleaned:
                record.title = cleaned[:120]
        if patch.description is not None:
            record.description = patch.description
        if patch.severity is not None:
            record.severity = patch.severity
        if patch.location is not None:
            self._validate_location(patch.location)
            record.building_id = patch.location.building_id
            record.building_name = patch.location.building_name
            record.floor = patch.location.floor
            record.room = patch.location.room

        self._repository.commit()
        return self._repository.get(report_id) or record

    def delete_report(self, student_id: str, report_id: str) -> None:
        record = self.get_report(student_id, report_id)
        if record.servicenow_sys_id:
            raise ForbiddenError(
                "This is an open campus incident, so it cannot be deleted. Ask operations to cancel it."
            )
        self._repository.delete(record)

    def transition(self, report_id: str, new_status: str, note: str | None = None) -> ReportRecord:
        """Moves a report along the lifecycle.

        Deliberately not reachable from a student-facing route: status is
        owned by operations, which will call this from the ServiceNow
        integration or an internal tool once that exists.
        """
        record = self._repository.get(report_id)
        if record is None:
            raise NotFoundError()

        allowed = STATUS_TRANSITIONS.get(record.status, set())
        if new_status not in allowed:
            raise ConflictError(f"A report in '{record.status}' cannot move to '{new_status}'.")

        record.status = new_status
        self._repository.commit()
        self._repository.add_event(report_id, new_status, note)
        return self._repository.get(report_id) or record

    def add_feedback(self, student_id: str, report_id: str, resolved: bool, comment: str | None):
        record = self.get_report(student_id, report_id)
        if record.status != "resolved":
            raise ConflictError("Feedback can be recorded once the report is resolved.")
        return self._repository.add_feedback(report_id, student_id, resolved, comment)

    # -- campus -----------------------------------------------------------

    def campus_pulse(self) -> dict[str, Any]:
        """The pulse, computed from records that actually exist.

        Nothing here is estimated: with no reports the counts are zero and the
        client is told the figures are computed from this deployment's own
        data, not from a campus-wide system it cannot see.
        """
        by_status = self._repository.counts_by_status()
        by_severity = self._repository.counts_by_severity()
        open_statuses = {"reported", "confirmed", "assigned", "investigating"}
        opened = sum(count for status, count in by_status.items() if status in open_statuses)
        resolved = by_status.get("resolved", 0)
        major = by_severity.get("high", 0) + by_severity.get("critical", 0)
        total = sum(by_status.values())

        score = 100
        if total:
            score = max(0, 100 - major * 8 - opened * 3)

        return {
            "score": score if total else None,
            "open_reports": opened,
            "resolved_reports": resolved,
            "major_reports": major,
            "total_reports": total,
            "source": "reports",
            "note": (
                "Computed from reports stored by this deployment. A campus-wide "
                "score requires the ServiceNow integration, which is not configured."
            ),
        }

    def locations(self) -> dict[str, Any]:
        directory = _campus_directory()
        if directory is None:
            return {
                "items": [],
                "source": "unconfigured",
                "note": "No campus directory is configured. Set CAMPUS_DIRECTORY_PATH to serve one.",
            }
        return {"items": directory, "source": "directory", "note": None}


def servicenow_unavailable() -> UnavailableError:
    return UnavailableError(
        "The ServiceNow integration is not configured. Set SERVICENOW_INSTANCE_URL, "
        "SERVICENOW_CLIENT_ID and SERVICENOW_CLIENT_SECRET on the server."
    )
