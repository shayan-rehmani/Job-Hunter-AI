from pydantic import BaseModel, Field, field_validator, model_validator


class JobPreferencesUpdate(BaseModel):
    preferred_job_titles: list[str] = Field(default_factory=list, max_length=30)
    preferred_locations: list[str] = Field(default_factory=list, max_length=20)

    experience_level: str | None = Field(default=None, max_length=100)

    preferred_job_types: list[str] = Field(default_factory=list, max_length=10)
    preferred_sources: list[str] = Field(default_factory=list, max_length=30)

    minimum_salary: int | None = Field(default=None, ge=0)
    maximum_salary: int | None = Field(default=None, ge=0)

    currency: str = Field(default="INR", max_length=10)
    willing_to_relocate: bool = False
    availability: str | None = Field(default=None, max_length=100)

    @field_validator(
        "preferred_job_titles",
        "preferred_locations",
        "preferred_job_types",
        "preferred_sources",
    )
    @classmethod
    def clean_lists(cls, values):
        return list(
            dict.fromkeys(
                item.strip()
                for item in values
                if item and item.strip()
            )
        )

    @field_validator("currency")
    @classmethod
    def clean_currency(cls, value):
        value = value.strip().upper()
        if not value:
            raise ValueError("Currency cannot be empty.")
        return value

    @field_validator("experience_level", "availability")
    @classmethod
    def clean_optional_text(cls, value):
        return value.strip() if value and value.strip() else None

    @model_validator(mode="after")
    def validate_salary_range(self):
        if (
            self.minimum_salary is not None
            and self.maximum_salary is not None
            and self.minimum_salary > self.maximum_salary
        ):
            raise ValueError(
                "Minimum salary cannot exceed maximum salary."
            )
        return self


class JobPreferencesResponse(JobPreferencesUpdate):
    id: int
    candidate_profile_id: int

    model_config = {"from_attributes": True}