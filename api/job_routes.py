
import logging

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from database.models import CandidateProfile, User
from services.job_search import search_jobs_from_resume


router = APIRouter(prefix="/jobs", tags=["Job Discovery"])


@router.post("/search")
def discover_jobs(
    selected_sources: list[str] | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Discover jobs using the authenticated user's saved resume."""

    profile = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found.",
        )

    if not profile.resume_analysis:
        raise HTTPException(
            status_code=400,
            detail="Please upload and analyze your resume before searching for jobs.",
        )

    try:
        result = search_jobs_from_resume(
            resume_analysis=profile.resume_analysis,
            location=profile.location,
            selected_sources=selected_sources,
        )

        return {
            "message": "Job discovery completed.",
            "candidate_location": profile.location,
            **result,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    except Exception:
        logger.exception("Job discovery failed")
        raise HTTPException(
            status_code=500,
            detail="Job discovery failed. Check backend logs.",
        )
