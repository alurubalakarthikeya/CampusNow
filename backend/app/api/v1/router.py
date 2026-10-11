"""Versioned API routes.

Every route is thin: it validates the request (Pydantic), asks the service
layer what is allowed, and returns a typed response. Ownership always comes
from the authenticated student — never from the request body.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Query, Response, status
from sqlalchemy.orm import Session

from ...core.security import Student, get_current_student
from ...db.session import get_db
from ...schemas.report import (
    FeedbackCreate,
    FeedbackOut,
    ReportCreate,
    ReportListOut,
    ReportOut,
    ReportUpdate,
)
from ...services.report_service import ReportService

router = APIRouter(prefix="/api/v1")


def _service(session: Session = Depends(get_db)) -> ReportService:
    return ReportService(session)


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    response: Response,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", max_length=128),
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> ReportOut:
    """Files a report for the authenticated student.

    The client sends its local report id as `Idempotency-Key`; replaying the
    same request returns the report already created instead of opening a
    second one.
    """
    record, created = service.create(student.subject, payload, idempotency_key)
    if not created:
        response.status_code = status.HTTP_200_OK
    return ReportOut.from_record(record)


@router.get("/reports", response_model=ReportListOut)
def list_reports(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> ReportListOut:
    page_result = service.list_reports(student.subject, page, page_size)
    return ReportListOut(
        items=[ReportOut.from_record(item) for item in page_result.items],
        total=page_result.total,
        page=page_result.page,
        page_size=page_result.page_size,
    )


@router.get("/reports/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> ReportOut:
    return ReportOut.from_record(service.get_report(student.subject, report_id))


@router.patch("/reports/{report_id}", response_model=ReportOut)
def update_report(
    report_id: str,
    payload: ReportUpdate,
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> ReportOut:
    return ReportOut.from_record(service.update_report(student.subject, report_id, payload))


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> Response:
    service.delete_report(student.subject, report_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/reports/{report_id}/feedback", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def add_feedback(
    report_id: str,
    payload: FeedbackCreate,
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> FeedbackOut:
    feedback = service.add_feedback(student.subject, report_id, payload.resolved, payload.comment)
    return FeedbackOut(
        report_id=feedback.report_id,
        resolved=feedback.resolved,
        comment=feedback.comment,
        created_at=feedback.created_at,
    )


@router.get("/locations")
def list_locations(
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> dict:
    """Campus locations. An unconfigured deployment returns an empty list and
    says why, rather than inventing blocks."""
    return service.locations()


@router.get("/campus/pulse")
def campus_pulse(
    student: Student = Depends(get_current_student),
    service: ReportService = Depends(_service),
) -> dict:
    """Campus health, computed from stored reports only."""
    return service.campus_pulse()
