"""Database session and models.

SQLAlchemy 2.0 with a synchronous engine. Development and the test suite use
SQLite; a deployed environment points `DATABASE_URL` at a server database,
where the concurrency, backup and storage questions belong to whoever runs it.
Route handlers never open a connection themselves — they take a session from
this module's dependency, and only the repository layer uses it.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterator

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

from ..core.config import get_settings


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ReportRecord(Base):
    """A report as the campus backend owns it.

    `student_id` is the identity provider's subject. Ownership is never taken
    from a request body, and the fields a student may change are limited to
    the ones the API schema exposes.
    """

    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_reports_student_created", "student_id", "created_at"),
        # A retried submission must not create a second incident.
        UniqueConstraint("student_id", "idempotency_key", name="uq_reports_student_idempotency"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), nullable=True)

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    impact: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    urgency: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=3)

    building_id: Mapped[str] = mapped_column(String(64), nullable=False)
    building_name: Mapped[str] = mapped_column(String(120), nullable=False)
    floor: Mapped[str | None] = mapped_column(String(32), nullable=True)
    room: Mapped[str | None] = mapped_column(String(40), nullable=True)

    status: Mapped[str] = mapped_column(String(24), nullable=False, default="reported")
    assignment_group: Mapped[str | None] = mapped_column(String(60), nullable=True)
    servicenow_sys_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    events: Mapped[list["ReportEventRecord"]] = relationship(
        back_populates="report", cascade="all, delete-orphan", order_by="ReportEventRecord.created_at"
    )
    feedback: Mapped[list["ReportFeedbackRecord"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )


class ReportEventRecord(Base):
    """One status change. Written by the service layer, never by a client."""

    __tablename__ = "report_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    note: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    report: Mapped[ReportRecord] = relationship(back_populates="events")


class ReportFeedbackRecord(Base):
    """A student's closing confirmation on a resolved report."""

    __tablename__ = "report_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[str] = mapped_column(String(128), nullable=False)
    resolved: Mapped[bool] = mapped_column(nullable=False)
    comment: Mapped[str | None] = mapped_column(String(400), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    report: Mapped[ReportRecord] = relationship(back_populates="feedback")


_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
        _engine = create_engine(settings.database_url, future=True, connect_args=connect_args)
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False, future=True)
    return _SessionLocal


def init_db() -> None:
    """Creates the schema for development and tests.

    A deployed environment manages schema changes with a migration tool; this
    function exists so a fresh checkout runs immediately.
    """
    Base.metadata.create_all(bind=get_engine())


def reset_engine() -> None:
    """Drops the cached engine and session factory (used by tests)."""
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionLocal = None


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed."""
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
