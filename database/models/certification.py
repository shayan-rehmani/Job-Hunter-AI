from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


class CertificationRecord(Base):
    __tablename__ = "certification_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(200))
    issuing_organization: Mapped[str | None] = mapped_column(String(200))
    date: Mapped[str | None] = mapped_column(String(30))

    candidate_profile = relationship("CandidateProfile", back_populates="certifications")
