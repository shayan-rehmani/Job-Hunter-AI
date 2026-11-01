
from pydantic import BaseModel, Field


class Education(BaseModel):
    qualification_level: str | None = None
    degree: str | None = None
    institution: str | None = None
    board_or_university: str | None = None
    stream: str | None = None
    specialization: str | None = None
    start_year: str | None = None
    end_year: str | None = None
    passing_year: str | None = None
    grade: str | None = None
    grade_type: str | None = None


class Experience(BaseModel):
    job_title: str | None = None
    company: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    responsibilities: list[str] = Field(default_factory=list)


class Project(BaseModel):
    name: str | None = None
    description: str | None = None
    technologies: list[str] = Field(default_factory=list)


class Certification(BaseModel):
    name: str | None = None
    issuing_organization: str | None = None
    date: str | None = None


class ResumeProfile(BaseModel):
    full_name: str | None = None
    date_of_birth: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    other_links: list[str] = Field(default_factory=list)

    professional_summary: str | None = None
    skills: list[str] = Field(default_factory=list)

    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)

    languages: list[str] = Field(default_factory=list)
