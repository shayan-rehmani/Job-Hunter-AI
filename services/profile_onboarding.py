from datetime import datetime

from models.resume_profile import ResumeProfile
from services.profile_completion import check_profile_completion


QUESTIONS = {
    "date_of_birth": (
        "What is your date of birth? "
        "Please enter it in DD/MM/YYYY format."
    ),
    "full_name": "What is your full legal name?",
    "email": "What is your email address?",
    "phone": "What is your contact number?",
    "location": "What is your current city and state?",
    "skills": "Please list your professional skills.",
    "education": "Please provide your highest educational qualification.",
}


def get_next_question(profile: ResumeProfile) -> dict:
    """Return the next question for missing required information."""

    completion = check_profile_completion(profile)

    if completion["is_complete"]:
        return {
            "completed": True,
            "message": "Your mandatory profile information is complete.",
        }

    missing_fields = [
        item["field"] for item in completion["missing_required"]
    ]

    for field in QUESTIONS:
        if field in missing_fields:
            return {
                "completed": False,
                "field": field,
                "question": QUESTIONS[field],
            }

    return {
        "completed": True,
        "message": "Your mandatory profile information is complete.",
    }


def save_profile_answer(
    profile: ResumeProfile,
    field: str,
    answer: str,
) -> ResumeProfile:
    """Validate and save a candidate-confirmed answer."""

    if field not in QUESTIONS:
        raise ValueError("This field cannot be updated through onboarding.")

    answer = answer.strip()

    if not answer:
        raise ValueError("Answer cannot be empty.")

    if field == "date_of_birth":
        try:
            dob = datetime.strptime(answer, "%d/%m/%Y")
        except ValueError:
            raise ValueError("Enter DOB in DD/MM/YYYY format.")

        if dob.date() >= datetime.now().date():
            raise ValueError("Date of birth must be in the past.")

        answer = dob.strftime("%d/%m/%Y")

    elif field == "email":
        if "@" not in answer or "." not in answer.split("@")[-1]:
            raise ValueError("Please enter a valid email address.")

    elif field == "phone":
        digits = "".join(char for char in answer if char.isdigit())
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Please enter a valid phone number.")

    elif field == "skills":
        answer = [item.strip() for item in answer.split(",") if item.strip()]

        if not answer:
            raise ValueError("Please provide at least one skill.")

    elif field == "education":
        answer = answer.strip()

    setattr(profile, field, answer)

    return profile