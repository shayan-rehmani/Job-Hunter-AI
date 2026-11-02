
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from database.models import (
    CandidateProfile,
    JobSearchPreferences,
    User,
)
from api.job_schemas import (
    JobPreferencesUpdate,
    JobPreferencesResponse,
)
from services.job_search import search_jobs_from_resume


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["Job Discovery"])


def get_user_profile(db: Session, user_id: int):
    profile = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.user_id == user_id)
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found.",
        )

    return profile


# --------------------------------------------------
# JOB DISCOVERY
# --------------------------------------------------

@router.post("/search")
def discover_jobs(
    selected_sources: list[str] | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Discover jobs using the authenticated user's saved resume and preferences."""

    profile = get_user_profile(db, current_user.id)

    if not profile.resume_analysis:
        raise HTTPException(
            status_code=400,
            detail="Please upload and analyze your resume before searching for jobs.",
        )

    try:
        preferences = (
            db.query(JobSearchPreferences)
            .filter(
                JobSearchPreferences.candidate_profile_id == profile.id
            )
            .first()
        )

        preferences_data = (
            {
                "preferred_job_titles": preferences.preferred_job_titles,
                "preferred_locations": preferences.preferred_locations,
                "experience_level": preferences.experience_level,
                "preferred_job_types": preferences.preferred_job_types,
                "preferred_sources": preferences.preferred_sources,
                "minimum_salary": preferences.minimum_salary,
                "maximum_salary": preferences.maximum_salary,
                "currency": preferences.currency,
                "willing_to_relocate": preferences.willing_to_relocate,
                "availability": preferences.availability,
            }
            if preferences
            else {}
        )

        result = search_jobs_from_resume(
            resume_analysis=profile.resume_analysis,
            location=profile.location,
            selected_sources=selected_sources,
            job_preferences=preferences_data,
        )

        return {
            "message": "Job discovery completed.",
            "candidate_location": profile.location,
            **result,
        }

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error))

    except Exception:
        logger.exception("Job discovery failed")
        raise HTTPException(
            status_code=500,
            detail="Job discovery failed. Check backend logs.",
        )


# --------------------------------------------------
# GET JOB PREFERENCES
# --------------------------------------------------

@router.get(
    "/preferences",
    response_model=JobPreferencesResponse,
)
def get_job_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)

    preferences = (
        db.query(JobSearchPreferences)
        .filter(
            JobSearchPreferences.candidate_profile_id == profile.id
        )
        .first()
    )

    if preferences is None:
        raise HTTPException(
            status_code=404,
            detail="Job preferences have not been saved yet.",
        )

    return preferences


# --------------------------------------------------
# CREATE OR UPDATE JOB PREFERENCES
# --------------------------------------------------

@router.put(
    "/preferences",
    response_model=JobPreferencesResponse,
)
def save_job_preferences(
    payload: JobPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)

    try:
        preferences = (
            db.query(JobSearchPreferences)
            .filter(
                JobSearchPreferences.candidate_profile_id == profile.id
            )
            .first()
        )

        if preferences is None:
            preferences = JobSearchPreferences(
                candidate_profile_id=profile.id
            )
            db.add(preferences)

        for field, value in payload.model_dump().items():
            setattr(preferences, field, value)

        db.commit()
        db.refresh(preferences)

        return preferences

    except Exception:
        db.rollback()
        logger.exception("Saving job preferences failed")
        raise HTTPException(
            status_code=500,
            detail="Could not save job preferences.",
        )


# --------------------------------------------------
# DELETE JOB PREFERENCES
# --------------------------------------------------

@router.delete("/preferences")
def delete_job_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)

    preferences = (
        db.query(JobSearchPreferences)
        .filter(
            JobSearchPreferences.candidate_profile_id == profile.id
        )
        .first()
    )

    if preferences is None:
        raise HTTPException(
            status_code=404,
            detail="No saved job preferences found.",
        )

    try:
        db.delete(preferences)
        db.commit()

        return {
            "message": "Job preferences deleted successfully."
        }

    except Exception:
        db.rollback()
        logger.exception("Deleting job preferences failed")
        raise HTTPException(
            status_code=500,
            detail="Could not delete job preferences.",
        )
