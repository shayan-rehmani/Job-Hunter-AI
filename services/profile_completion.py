from models.resume_profile import ResumeProfile


REQUIRED_FIELDS = {
    "full_name": "Full name",
    "date_of_birth": "Date of birth",
    "email": "Email address",
    "phone": "Phone number",
    "location": "Current location",
    "skills": "Professional skills",
    "education": "Education details",
}

OPTIONAL_FIELDS = {
    "linkedin_url": "LinkedIn profile",
    "github_url": "GitHub profile",
    "portfolio_url": "Portfolio website",
    "experience": "Work experience",
    "certifications": "Certifications",
}


def check_profile_completion(profile: ResumeProfile) -> dict:
    """Identify missing required and optional profile information."""

    missing_required = []
    missing_optional = []

    for field, label in REQUIRED_FIELDS.items():
        value = getattr(profile, field)

        if not value:
            missing_required.append({
                "field": field,
                "label": label,
            })

    for field, label in OPTIONAL_FIELDS.items():
        value = getattr(profile, field)

        if not value:
            missing_optional.append({
                "field": field,
                "label": label,
            })

    total_required = len(REQUIRED_FIELDS)
    completed_required = total_required - len(missing_required)

    completion_percentage = round(
        (completed_required / total_required) * 100
    )

    return {
        "is_complete": len(missing_required) == 0,
        "completion_percentage": completion_percentage,
        "missing_required": missing_required,
        "missing_optional": missing_optional,
    }