
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.connection import Base


class EducationRecord(Base):
    __tablename__ = "education_records"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    qualification_level: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    degree: Mapped[str | None] = mapped_column(String(150))
    institution: Mapped[str | None] = mapped_column(String(200))
    board_or_university: Mapped[str | None] = mapped_column(String(200))
    stream: Mapped[str | None] = mapped_column(String(150))
    specialization: Mapped[str | None] = mapped_column(String(150))

    start_year: Mapped[str | None] = mapped_column(String(4))
    end_year: Mapped[str | None] = mapped_column(String(4))
    passing_year: Mapped[str | None] = mapped_column(String(4))

    grade: Mapped[str | None] = mapped_column(String(20))
    grade_type: Mapped[str | None] = mapped_column(String(30))

    # Each education record belongs to one candidate profile.
    candidate_profile = relationship(
        "CandidateProfile",
        back_populates="education_records"
    )
