"""Report request and response schemas.

These are the contract the mobile client codes against (`services/reportService.ts`
sends exactly these field names). Requests forbid unknown fields, so a client
cannot smuggle in an assignment group, a technician, a priority or any other
server-owned value by adding a key to the body.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

ReportCategory = Literal["wifi", "lab", "projector", "ac", "mess", "access", "classroom", "other"]
Severity = Literal["low", "medium", "high", "critical"]
Impact = Literal["low", "medium", "high"]
Urgency = Literal["low", "medium", "high"]
Status = Literal["reported", "confirmed", "assigned", "investigating", "resolved"]

MAX_TITLE = 120
MAX_DESCRIPTION = 1000
MAX_ROOM = 40


class LocationPayload(BaseModel):
    """Where the fault is. `building_id` must match the campus directory."""

    model_config = ConfigDict(extra="forbid")

    building_id: str = Field(min_length=1, max_length=64)
    building_name: str = Field(min_length=1, max_length=120)
    floor: str | None = Field(default=None, max_length=32)
    room: str | None = Field(default=None, max_length=MAX_ROOM)
    label: str | None = Field(default=None, max_length=200)

    @field_validator("room")
    @classmethod
    def _clean_room(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split())
        return cleaned or None


class ReportCreate(BaseModel):
    """The only fields a student may set when filing a report."""

    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, max_length=MAX_TITLE)
    description: str = Field(default="", max_length=MAX_DESCRIPTION)
    category: ReportCategory
    severity: Severity = "medium"
    impact: Impact = "medium"
    urgency: Urgency = "medium"
    location: LocationPayload
    affected_students: int = Field(default=1, ge=1, le=100000)

    @field_validator("title", "description")
    @classmethod
    def _clean(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return " ".join(value.split()).strip()


class ReportUpdate(BaseModel):
    """Permitted edits on a report the student still owns.

    Status is deliberately absent: the lifecycle is owned by operations, and a
    client may never advance an incident through its workflow.
    """

    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, max_length=MAX_TITLE)
    description: str | None = Field(default=None, max_length=MAX_DESCRIPTION)
    severity: Severity | None = None
    location: LocationPayload | None = None


class ReportEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: Status
    note: str | None = None
    created_at: datetime


class ReportOut(BaseModel):
    """What the client receives. Server-owned fields are read-only here."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    category: ReportCategory
    severity: Severity
    impact: Impact
    urgency: Urgency
    priority: int
    status: Status
    location: LocationPayload
    assignment_group: str | None = None
    servicenow_sys_id: str | None = None
    created_at: datetime
    updated_at: datetime
    events: list[ReportEventOut] = []

    @classmethod
    def from_record(cls, record) -> "ReportOut":  # noqa: ANN001 - ORM record
        return cls(
            id=record.id,
            title=record.title,
            description=record.description,
            category=record.category,
            severity=record.severity,
            impact=record.impact,
            urgency=record.urgency,
            priority=record.priority,
            status=record.status,
            location=LocationPayload(
                building_id=record.building_id,
                building_name=record.building_name,
                floor=record.floor,
                room=record.room,
                label=None,
            ),
            assignment_group=record.assignment_group,
            servicenow_sys_id=record.servicenow_sys_id,
            created_at=record.created_at,
            updated_at=record.updated_at,
            events=[ReportEventOut.model_validate(event) for event in record.events],
        )


class ReportListOut(BaseModel):
    """Paginated envelope, matching `PaginatedResponse<T>` in the app."""

    items: list[ReportOut]
    total: int
    page: int
    page_size: int


class FeedbackCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resolved: bool
    comment: str | None = Field(default=None, max_length=400)

    @field_validator("comment")
    @classmethod
    def _clean_comment(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split()).strip()
        return cleaned or None


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: str
    resolved: bool
    comment: str | None = None
    created_at: datetime
