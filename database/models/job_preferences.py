from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


class JobSearchPreferences(Base):
    __tablename__ = "job_search_preferences"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    preferred_job_titles: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    preferred_locations: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    experience_level: Mapped[str | None] = mapped_column(
        String(100)
    )

    preferred_job_types: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    preferred_sources: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    minimum_salary: Mapped[int | None] = mapped_column(Integer)

    maximum_salary: Mapped[int | None] = mapped_column(Integer)

    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False
    )

    willing_to_relocate: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    availability: Mapped[str | None] = mapped_column(
        String(100)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    candidate_profile = relationship(
        "CandidateProfile",
        back_populates="job_preferences"
    )