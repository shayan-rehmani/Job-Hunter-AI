from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


class LanguageRecord(Base):
    __tablename__ = "language_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    candidate_profile = relationship("CandidateProfile", back_populates="languages")
