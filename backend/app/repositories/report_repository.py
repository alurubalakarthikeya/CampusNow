"""Report persistence.

Nothing above this layer touches SQLAlchemy. The API talks to the service,
the service talks to this repository, and this repository is the only code
that knows about tables, transactions and queries.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..db.session import ReportEventRecord, ReportFeedbackRecord, ReportRecord


@dataclass(frozen=True)
class Page:
    items: Sequence[ReportRecord]
    total: int
    page: int
    page_size: int


class ReportRepository(Protocol):
    def create(self, report: ReportRecord) -> ReportRecord: ...

    def get(self, report_id: str) -> ReportRecord | None: ...

    def find_by_idempotency_key(self, student_id: str, key: str) -> ReportRecord | None: ...

    def list_for_student(self, student_id: str, page: int, page_size: int) -> Page: ...

    def add_event(self, report_id: str, status: str, note: str | None = None) -> ReportEventRecord: ...

    def add_feedback(
        self, report_id: str, student_id: str, resolved: bool, comment: str | None
    ) -> ReportFeedbackRecord: ...

    def commit(self) -> None: ...

    def delete(self, report: ReportRecord) -> None: ...

    def counts_by_status(self, student_id: str | None = None) -> dict[str, int]: ...

    def counts_by_severity(self) -> dict[str, int]: ...


class SqlReportRepository(ReportRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def _loaded(self, query):
        return query.options(selectinload(ReportRecord.events))

    def create(self, report: ReportRecord) -> ReportRecord:
        self._session.add(report)
        self._session.commit()
        self._session.refresh(report)
        return report

    def get(self, report_id: str) -> ReportRecord | None:
        query = self._loaded(select(ReportRecord).where(ReportRecord.id == report_id))
        return self._session.execute(query).scalar_one_or_none()

    def find_by_idempotency_key(self, student_id: str, key: str) -> ReportRecord | None:
        query = self._loaded(
            select(ReportRecord).where(
                ReportRecord.student_id == student_id,
                ReportRecord.idempotency_key == key,
            )
        )
        return self._session.execute(query).scalar_one_or_none()

    def list_for_student(self, student_id: str, page: int, page_size: int) -> Page:
        base = select(ReportRecord).where(ReportRecord.student_id == student_id)
        total = self._session.execute(
            select(func.count()).select_from(base.subquery())
        ).scalar_one()
        query = (
            self._loaded(base)
            .order_by(ReportRecord.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = self._session.execute(query).scalars().unique().all()
        return Page(items=items, total=int(total), page=page, page_size=page_size)

    def add_event(self, report_id: str, status: str, note: str | None = None) -> ReportEventRecord:
        event = ReportEventRecord(report_id=report_id, status=status, note=note)
        self._session.add(event)
        self._session.commit()
        self._session.refresh(event)
        return event

    def add_feedback(
        self, report_id: str, student_id: str, resolved: bool, comment: str | None
    ) -> ReportFeedbackRecord:
        feedback = ReportFeedbackRecord(
            report_id=report_id, student_id=student_id, resolved=resolved, comment=comment
        )
        self._session.add(feedback)
        self._session.commit()
        self._session.refresh(feedback)
        return feedback

    def commit(self) -> None:
        """Persists edits made to a record the caller already holds."""
        self._session.commit()

    def delete(self, report: ReportRecord) -> None:
        self._session.delete(report)
        self._session.commit()

    def counts_by_status(self, student_id: str | None = None) -> dict[str, int]:
        query = select(ReportRecord.status, func.count()).group_by(ReportRecord.status)
        if student_id is not None:
            query = query.where(ReportRecord.student_id == student_id)
        return {status: int(count) for status, count in self._session.execute(query).all()}

    def counts_by_severity(self) -> dict[str, int]:
        query = select(ReportRecord.severity, func.count()).group_by(ReportRecord.severity)
        return {severity: int(count) for severity, count in self._session.execute(query).all()}
