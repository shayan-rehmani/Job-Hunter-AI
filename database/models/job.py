
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


class Job(Base):
    __tablename__ = "jobs"

    __table_args__ = (
        UniqueConstraint(
            "candidate_profile_id",
            "source_name",
            "source_job_id",
            name="uq_candidate_source_job",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_job_id: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))

    work_mode: Mapped[str | None] = mapped_column(String(100))
    employment_type: Mapped[str | None] = mapped_column(String(100))
    experience_level: Mapped[str | None] = mapped_column(String(100))

    description: Mapped[str | None] = mapped_column(Text)
    required_skills: Mapped[list | None] = mapped_column(JSON)

    source_name: Mapped[str] = mapped_column(String(100), nullable=False)
    application_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    employer_url: Mapped[str | None] = mapped_column(String(1000))

    posted_date: Mapped[str | None] = mapped_column(String(100))
    last_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )

    match_percentage: Mapped[int | None] = mapped_column(Integer)
    matched_skills: Mapped[list | None] = mapped_column(JSON)
    missing_skills: Mapped[list | None] = mapped_column(JSON)

    application_status: Mapped[str] = mapped_column(
        String(50),
        default="Discovered",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    candidate_profile = relationship(
        "CandidateProfile",
        back_populates="jobs",
    )
