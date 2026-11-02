
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class JobSaveRequest(BaseModel):
    source_job_id: str = Field(min_length=1, max_length=500)
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    location: str | None = None

    work_mode: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None

    description: str | None = None
    required_skills: list[str] = Field(default_factory=list)

    source_name: str = Field(min_length=1, max_length=100)
    application_url: HttpUrl
    employer_url: HttpUrl | None = None

    posted_date: str | None = None


class JobResponse(BaseModel):
    id: int
    candidate_profile_id: int

    source_job_id: str
    title: str
    company: str
    location: str | None

    work_mode: str | None
    employment_type: str | None
    experience_level: str | None

    description: str | None
    required_skills: list[str] | None

    source_name: str
    application_url: str
    employer_url: str | None

    posted_date: str | None
    last_verified_at: datetime | None

    match_percentage: int | None
    matched_skills: list[str] | None
    missing_skills: list[str] | None

    application_status: str
    is_active: bool

    discovered_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobStatusUpdate(BaseModel):
    application_status: str = Field(
        pattern="^(Discovered|Saved|Interested|Applied|Interview|Rejected|Offer)$"
    )
