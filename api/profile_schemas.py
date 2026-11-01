from pydantic import BaseModel, Field, field_validator


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=150)
    date_of_birth: str | None = None
    phone: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=150)
    linkedin_url: str | None = Field(default=None, max_length=500)
    github_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    professional_summary: str | None = None

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value):
        if value is None:
            return value
        from datetime import datetime
        try:
            parsed = datetime.strptime(value, "%d/%m/%Y")
        except ValueError:
            raise ValueError("Enter DOB in DD/MM/YYYY format.")
        if parsed.date() >= datetime.now().date():
            raise ValueError("Date of birth must be in the past.")
        return parsed.strftime("%d/%m/%Y")


class ProfileResponse(BaseModel):
    id: int
    full_name: str | None = None
    date_of_birth: str | None = None
    email: str
    phone: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    professional_summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    education: list[dict] = Field(default_factory=list)
    experience: list[dict] = Field(default_factory=list)
    projects: list[dict] = Field(default_factory=list)
    certifications: list[dict] = Field(default_factory=list)
    languages: list[dict] = Field(default_factory=list)

class SkillsUpdate(BaseModel):
    skills: list[str] = Field(max_length=100)

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, values):
        cleaned = list(dict.fromkeys(item.strip() for item in values if item.strip()))
        if not cleaned:
            raise ValueError("Provide at least one valid skill.")
        return cleaned



class EducationCreate(BaseModel):
    qualification_level: str = Field(min_length=1, max_length=50)
    degree: str | None = Field(default=None, max_length=150)
    institution: str | None = Field(default=None, max_length=200)
    board_or_university: str | None = Field(default=None, max_length=200)
    stream: str | None = Field(default=None, max_length=150)
    specialization: str | None = Field(default=None, max_length=150)
    start_year: str | None = Field(default=None, max_length=4)
    end_year: str | None = Field(default=None, max_length=4)
    passing_year: str | None = Field(default=None, max_length=4)
    grade: str | None = Field(default=None, max_length=20)
    grade_type: str | None = Field(default=None, max_length=30)

    @field_validator("qualification_level")
    @classmethod
    def validate_qualification_level(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Qualification level cannot be empty.")
        return value


class ExperienceCreate(BaseModel):
    job_title: str | None = Field(default=None, max_length=150)
    company: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=150)
    start_date: str | None = Field(default=None, max_length=30)
    end_date: str | None = Field(default=None, max_length=30)
    responsibilities: str | None = None

    @field_validator("job_title", "company")
    @classmethod
    def clean_text(cls, value):
        return value.strip() if value else value


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    technologies: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Project name cannot be empty.")
        return value


class CertificationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    issuing_organization: str | None = Field(default=None, max_length=200)
    date: str | None = Field(default=None, max_length=30)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Certification name cannot be empty.")
        return value


class LanguageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Language name cannot be empty.")
        return value
