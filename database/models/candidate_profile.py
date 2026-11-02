
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    full_name: Mapped[str | None] = mapped_column(String(150))
    date_of_birth: Mapped[str | None] = mapped_column(String(10))
    phone: Mapped[str | None] = mapped_column(String(20))
    location: Mapped[str | None] = mapped_column(String(150))

    linkedin_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(500))
    portfolio_url: Mapped[str | None] = mapped_column(String(500))

    professional_summary: Mapped[str | None] = mapped_column(Text)

    resume_filename: Mapped[str | None] = mapped_column(String(255))
    resume_file_path: Mapped[str | None] = mapped_column(String(500))
    resume_analysis: Mapped[dict | None] = mapped_column(JSON)

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

    # Each candidate profile belongs to one user.
    user = relationship(
        "User",
        back_populates="candidate_profile"
    )

    languages = relationship(
        "LanguageRecord",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    certifications = relationship(
        "CertificationRecord",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    projects = relationship(
        "ProjectRecord",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    experience_records = relationship(
        "ExperienceRecord",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    skills = relationship(
        "Skill",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    # One candidate profile can have multiple education records.
    education_records = relationship(
        "EducationRecord",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )

    job_preferences = relationship(
        "JobSearchPreferences",
        back_populates="candidate_profile",
        uselist=False,
        cascade="all, delete-orphan"
    )

    jobs = relationship(
        "Job",
        back_populates="candidate_profile",
        cascade="all, delete-orphan"
    )