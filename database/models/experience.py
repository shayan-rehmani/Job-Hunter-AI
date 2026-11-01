from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


class ExperienceRecord(Base):
    __tablename__ = "experience_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    job_title: Mapped[str | None] = mapped_column(String(150))
    company: Mapped[str | None] = mapped_column(String(200))
    location: Mapped[str | None] = mapped_column(String(150))
    start_date: Mapped[str | None] = mapped_column(String(30))
    end_date: Mapped[str | None] = mapped_column(String(30))
    responsibilities: Mapped[str | None] = mapped_column(Text)

    candidate_profile = relationship("CandidateProfile", back_populates="experience_records")
