
import hashlib
import logging
from datetime import datetime, timezone
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from database.models import Job

logger = logging.getLogger(__name__)

def normalize_datetime(value):
    """Convert ISO datetime strings into Python datetime objects."""

    if isinstance(value, datetime):
        return value

    if isinstance(value, str) and value.strip():
        try:
            return datetime.fromisoformat(
                value.strip().replace("Z", "+00:00")
            )
        except ValueError:
            logger.warning("Invalid datetime received: %s", value)

    return datetime.now(timezone.utc)

def make_source_job_id(source_name: str, application_url: str) -> str:
    """Create a stable ID from the source and original job URL."""

    normalized_url = application_url.strip().rstrip("/")
    raw_value = f"{source_name.lower().strip()}|{normalized_url}"

    return hashlib.sha256(
        raw_value.encode("utf-8")
    ).hexdigest()


def save_discovered_jobs(
    db: Session,
    candidate_profile_id: int,
    jobs: list[dict],
) -> int:
    """
    Save discovered jobs and safely update existing duplicates.

    Empty incoming values never overwrite useful existing information.
    """

    saved_count = 0

    try:
        for item in jobs:
            if not isinstance(item, dict):
                continue

            title = item.get("title")
            company = item.get("company")

            # Support both search-service and storage field names.
            application_url = (
                item.get("application_url")
                or item.get("url")
            )

            source_name = item.get("source_name")

            # Required fields for a new valid job record.
            if not all([
                isinstance(title, str) and title.strip(),
                isinstance(company, str) and company.strip(),
                isinstance(application_url, str) and application_url.strip(),
                isinstance(source_name, str) and source_name.strip(),
            ]):
                logger.warning(
                    "Skipping incomplete job record: %s",
                    item,
                )
                continue

            title = title.strip()
            company = company.strip()
            application_url = application_url.strip()
            source_name = source_name.strip()

            parsed_url = urlparse(application_url)

            if parsed_url.scheme not in ("http", "https") or not parsed_url.netloc:
                logger.warning(
                    "Skipping job with invalid application URL: %s",
                    application_url,
                )
                continue

            source_job_id = make_source_job_id(
                source_name,
                application_url,
            )

            existing = (
                db.query(Job)
                .filter(
                    Job.candidate_profile_id == candidate_profile_id,
                    Job.source_name == source_name,
                    Job.source_job_id == source_job_id,
                )
                .first()
            )

            # Support aliases from different parts of the application.
            employer_url = (
                item.get("employer_url")
                or item.get("employer_application_url")
            )

            last_verified_at = normalize_datetime(
                item.get("last_verified_at")
                or item.get("last_checked_at")
            )

            # Do not replace existing information with None or empty values.
            values = {
                "title": title,
                "company": company,
                "location": item.get("location"),
                "work_mode": item.get("work_mode"),
                "employment_type": item.get("employment_type"),
                "experience_level": item.get("experience_level"),
                "description": item.get("description"),
                "required_skills": item.get("required_skills"),
                "application_url": application_url,
                "employer_url": employer_url,
                "posted_date": item.get("posted_date"),
                "match_percentage": item.get("match_percentage"),
                "matched_skills": item.get("matched_skills"),
                "missing_skills": item.get("missing_skills"),
                "last_verified_at": last_verified_at,
                "is_active": True,
            }

            if existing:
                for field, value in values.items():

                    # Empty strings, None and empty lists must not
                    # erase previously saved useful information.
                    if value is None or value == "":
                        continue

                    if isinstance(value, list) and not value:
                        continue

                    setattr(existing, field, value)

                logger.info(
                    "Updated existing job: %s at %s",
                    title,
                    company,
                )

            else:
                # New records must have their essential information.
                db.add(
                    Job(
                        candidate_profile_id=candidate_profile_id,
                        source_name=source_name,
                        source_job_id=source_job_id,
                        title=title,
                        company=company,
                        location=item.get("location"),
                        work_mode=item.get("work_mode"),
                        employment_type=item.get("employment_type"),
                        experience_level=item.get("experience_level"),
                        description=item.get("description"),
                        required_skills=item.get("required_skills") or [],
                        application_url=application_url,
                        employer_url=employer_url,
                        posted_date=item.get("posted_date"),
                        match_percentage=item.get("match_percentage"),
                        matched_skills=item.get("matched_skills"),
                        missing_skills=item.get("missing_skills"),
                        last_verified_at=last_verified_at,
                        is_active=True,
                    )
                )

                logger.info(
                    "Saved new job: %s at %s",
                    title,
                    company,
                )

            saved_count += 1

        db.commit()

        logger.info(
            "Job storage completed. Processed %s valid records.",
            saved_count,
        )

        return saved_count

    except Exception:
        db.rollback()
        logger.exception("Saving discovered jobs failed")
        raise


def get_saved_jobs(
    db: Session,
    candidate_profile_id: int,
) -> list[Job]:
    """Return active saved jobs for one candidate."""

    return (
        db.query(Job)
        .filter(
            Job.candidate_profile_id == candidate_profile_id,
            Job.is_active.is_(True),
        )
        .order_by(Job.discovered_at.desc())
        .all()
    )
