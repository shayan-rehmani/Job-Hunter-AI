from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


class ProjectRecord(Base):
    __tablename__ = "project_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    technologies: Mapped[str | None] = mapped_column(Text)

    candidate_profile = relationship("CandidateProfile", back_populates="projects")
