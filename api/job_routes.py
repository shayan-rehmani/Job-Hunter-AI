
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.job_storage_schemas import JobResponse, JobStatusUpdate
from services.job_storage import get_saved_jobs, save_discovered_jobs

from auth.dependencies import get_current_user
from database.connection import get_db
from database.models import (
    CandidateProfile,
    JobSearchPreferences,
    User,
    Job,
)
from api.job_schemas import (
    JobPreferencesUpdate,
    JobPreferencesResponse,
)
from services.job_search import search_jobs_from_resume

from services.job_matching import calculate_skill_match

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

        jobs= result.get("jobs",[])

        saved_count = save_discovered_jobs(
            db=db,
            candidate_profile_id=profile.id,
            jobs=jobs,
        )
        return {
            "message": "Job discovery completed and result saved.",
            "candidate_location": profile.location,
            "saved_count": saved_count,
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
# AI JOB MATCHES
# --------------------------------------------------

@router.post("/matches")
def get_ai_job_matches(
    selected_sources: list[str] | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Discover jobs and calculate transparent resume skills matches."""

    profile = get_user_profile(db, current_user.id)

    if not profile.resume_analysis:
        raise HTTPException(
            status_code=400,
            detail="Please upload and analyze your resume first.",
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

        candidate_skills = profile.resume_analysis.get("skills", [])

        matched_jobs = []

        for job in result.get("jobs", []):
            skill_match = calculate_skill_match(
                candidate_skills=candidate_skills,
                required_skills=job.get("required_skills", []),
            )

            matched_jobs.append({
                **job,
                **skill_match,
            })

        matched_jobs.sort(
            key=lambda job: (
                job["match_percentage"] is None,
                -(job["match_percentage"] or 0),
            )
        )

        saved_count = save_discovered_jobs(
            db=db,
            candidate_profile_id=profile.id,
            jobs=matched_jobs,
        )

        return {
            "message": "AI job matching completed and result saved.",
            "candidate_location": profile.location,
            "total_matches": len(matched_jobs),
            "saved_count": saved_count,
            "jobs": matched_jobs,
        }

    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error))

    except Exception:
        logger.exception("AI job matching failed")
        raise HTTPException(
            status_code=500,
            detail="AI job matching failed. Check backend logs.",
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


# --------------------------------------------------
# SAVED JOBS
# --------------------------------------------------

@router.get("/saved", response_model=list[JobResponse])
def list_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve saved jobs belonging to the logged-in user."""

    profile = get_user_profile(db, current_user.id)

    return get_saved_jobs(
        db=db,
        candidate_profile_id=profile.id,
    )


# --------------------------------------------------
# UPDATE JOB APPLICATION STATUS
# --------------------------------------------------

@router.patch(
    "/saved/{job_id}/status",
    response_model=JobResponse,
)
def update_saved_job_status(
    job_id: int,
    payload: JobStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.candidate_profile_id == profile.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Saved job not found.",
        )

    job.application_status = payload.application_status

    db.commit()
    db.refresh(job)

    return job


# --------------------------------------------------
# DELETE SAVED JOB
# --------------------------------------------------

@router.delete("/saved/{job_id}")
def delete_saved_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_user_profile(db, current_user.id)

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.candidate_profile_id == profile.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Saved job not found.",
        )

    db.delete(job)
    db.commit()

    return {"message": "Saved job deleted successfully."}



# --------------------------------------------------
# AI MATCHES FROM SAVED JOBS
# --------------------------------------------------

@router.get("/matches/saved")
def get_saved_job_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate skill matches for previously discovered jobs."""

    profile = get_user_profile(db, current_user.id)

    if not profile.resume_analysis:
        raise HTTPException(
            status_code=400,
            detail="Please upload and analyze your resume first.",
        )

    try:
        saved_jobs = get_saved_jobs(
            db=db,
            candidate_profile_id=profile.id,
        )

        candidate_skills = profile.resume_analysis.get("skills", [])

        matched_jobs = []

        for job in saved_jobs:
            skill_match = calculate_skill_match(
                candidate_skills=candidate_skills,
                required_skills=job.required_skills or [],
            )

            job.match_percentage = skill_match["match_percentage"]
            job.matched_skills = skill_match["matched_skills"]
            job.missing_skills = skill_match["missing_skills"]

            matched_jobs.append(job)

        matched_jobs.sort(
            key=lambda job: (
                job.match_percentage is None,
                -(job.match_percentage or 0),
            )
        )

        db.commit()

        return {
            "message": "Saved job matches calculated successfully.",
            "total_matches": len(matched_jobs),
            "jobs": matched_jobs,
        }

    except Exception:
        db.rollback()
        logger.exception("Calculating saved job matches failed")
        raise HTTPException(
            status_code=500,
            detail="Unable to calculate saved job matches.",
        )
