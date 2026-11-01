
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import (
    CandidateProfile,
    User,
    Skill,
    EducationRecord,
    ExperienceRecord,
    ProjectRecord,
    CertificationRecord,
    LanguageRecord,
)
from auth.dependencies import get_current_user
from api.profile_schemas import (
    ProfileUpdate,
    ProfileResponse,
    SkillsUpdate,
    EducationCreate,
    ExperienceCreate,
    ProjectCreate,
    CertificationCreate,
    LanguageCreate,
)

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def get_candidate_profile(current_user, db):
    profile = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.user_id == current_user.id)
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate profile not found."
        )

    return profile


def get_owned_record(db, model, record_id, profile_id):
    record = (
        db.query(model)
        .filter(
            model.id == record_id,
            model.candidate_profile_id == profile_id
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Record not found."
        )

    return record


def save_record(db, record, error_message):
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail=error_message)


def update_record(db, record, data, error_message):
    try:
        for field, value in data.items():
            setattr(record, field, value)

        db.commit()
        db.refresh(record)
        return record
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail=error_message)


def delete_record(db, record, error_message):
    try:
        db.delete(record)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail=error_message)


# --------------------------------------------------
# Profile Serialization
# --------------------------------------------------

def serialize_profile(profile, user):
    return {
        "id": profile.id,
        "full_name": profile.full_name,
        "date_of_birth": profile.date_of_birth,
        "email": user.email,
        "phone": profile.phone,
        "location": profile.location,
        "linkedin_url": profile.linkedin_url,
        "github_url": profile.github_url,
        "portfolio_url": profile.portfolio_url,
        "professional_summary": profile.professional_summary,

        "skills": [item.name for item in profile.skills],

        "education": [
            {
                "id": e.id,
                "qualification_level": e.qualification_level,
                "degree": e.degree,
                "institution": e.institution,
                "board_or_university": e.board_or_university,
                "stream": e.stream,
                "specialization": e.specialization,
                "start_year": e.start_year,
                "end_year": e.end_year,
                "passing_year": e.passing_year,
                "grade": e.grade,
                "grade_type": e.grade_type,
            }
            for e in profile.education_records
        ],

        "experience": [
            {
                "id": e.id,
                "job_title": e.job_title,
                "company": e.company,
                "location": e.location,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "responsibilities": e.responsibilities,
            }
            for e in profile.experience_records
        ],

        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "technologies": p.technologies,
            }
            for p in profile.projects
        ],

        "certifications": [
            {
                "id": c.id,
                "name": c.name,
                "issuing_organization": c.issuing_organization,
                "date": c.date,
            }
            for c in profile.certifications
        ],

        "languages": [
            {"id": item.id, "name": item.name}
            for item in profile.languages
        ],
    }


# --------------------------------------------------
# Personal Profile
# --------------------------------------------------

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)
    return serialize_profile(profile, current_user)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    request: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    try:
        for field, value in request.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)

        db.commit()
        db.refresh(profile)

        return serialize_profile(profile, current_user)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Profile could not be updated."
        )


@router.get("/me/completion")
def get_my_profile_completion(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    required = {
        "full_name": bool(profile.full_name and profile.full_name.strip()),
        "date_of_birth": bool(profile.date_of_birth),
        "email": bool(current_user.email),
        "phone": bool(profile.phone),
        "location": bool(profile.location),
        "skills": bool(profile.skills),
        "education": bool(profile.education_records),
    }

    missing = [
        field for field, completed in required.items()
        if not completed
    ]

    completed_count = len(required) - len(missing)

    return {
        "is_complete": len(missing) == 0,
        "completion_percentage": round(
            completed_count / len(required) * 100
        ),
        "completed_fields": [
            field for field, completed in required.items()
            if completed
        ],
        "missing_required": missing,
    }


# --------------------------------------------------
# Skills
# --------------------------------------------------

@router.post("/me/skills")
def update_my_skills(
    request: SkillsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    try:
        profile.skills.clear()

        for name in request.skills:
            profile.skills.append(Skill(name=name))

        db.commit()
        db.refresh(profile)

        return {
            "message": "Skills saved successfully.",
            "skills": [item.name for item in profile.skills],
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Skills could not be saved."
        )


# --------------------------------------------------
# Education: Add, Update, Delete
# --------------------------------------------------

@router.post("/me/education")
def add_my_education(
    request: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    education = EducationRecord(
        candidate_profile_id=profile.id,
        **request.model_dump()
    )

    education = save_record(
        db, education, "Education could not be saved."
    )

    return {
        "message": "Education saved successfully.",
        "education": {
            "id": education.id,
            **request.model_dump(),
        },
    }


@router.put("/me/education/{record_id}")
def update_my_education(
    record_id: int,
    request: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    education = get_owned_record(
        db, EducationRecord, record_id, profile.id
    )

    update_record(
        db,
        education,
        request.model_dump(),
        "Education could not be updated."
    )

    return {"message": "Education updated successfully."}


@router.delete("/me/education/{record_id}")
def delete_my_education(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    education = get_owned_record(
        db, EducationRecord, record_id, profile.id
    )

    delete_record(db, education, "Education could not be deleted.")

    return {"message": "Education deleted successfully."}


# --------------------------------------------------
# Work Experience: Add, Update, Delete
# --------------------------------------------------

@router.post("/me/experience")
def add_my_experience(
    request: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    if not request.job_title and not request.company:
        raise HTTPException(
            status_code=422,
            detail="Provide at least a job title or company."
        )

    experience = ExperienceRecord(
        candidate_profile_id=profile.id,
        **request.model_dump()
    )

    experience = save_record(
        db, experience, "Experience could not be saved."
    )

    return {
        "message": "Experience saved successfully.",
        "experience": {
            "id": experience.id,
            **request.model_dump(),
        },
    }


@router.put("/me/experience/{record_id}")
def update_my_experience(
    record_id: int,
    request: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    if not request.job_title and not request.company:
        raise HTTPException(
            status_code=422,
            detail="Provide at least a job title or company."
        )

    experience = get_owned_record(
        db, ExperienceRecord, record_id, profile.id
    )

    update_record(
        db,
        experience,
        request.model_dump(),
        "Experience could not be updated."
    )

    return {"message": "Experience updated successfully."}


@router.delete("/me/experience/{record_id}")
def delete_my_experience(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    experience = get_owned_record(
        db, ExperienceRecord, record_id, profile.id
    )

    delete_record(db, experience, "Experience could not be deleted.")

    return {"message": "Experience deleted successfully."}


# --------------------------------------------------
# Projects: Add, Update, Delete
# --------------------------------------------------

@router.post("/me/projects")
def add_my_project(
    request: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    project = ProjectRecord(
        candidate_profile_id=profile.id,
        **request.model_dump()
    )

    project = save_record(
        db, project, "Project could not be saved."
    )

    return {
        "message": "Project saved successfully.",
        "project": {
            "id": project.id,
            **request.model_dump(),
        },
    }


@router.put("/me/projects/{record_id}")
def update_my_project(
    record_id: int,
    request: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    project = get_owned_record(
        db, ProjectRecord, record_id, profile.id
    )

    update_record(
        db,
        project,
        request.model_dump(),
        "Project could not be updated."
    )

    return {"message": "Project updated successfully."}


@router.delete("/me/projects/{record_id}")
def delete_my_project(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    project = get_owned_record(
        db, ProjectRecord, record_id, profile.id
    )

    delete_record(db, project, "Project could not be deleted.")

    return {"message": "Project deleted successfully."}


# --------------------------------------------------
# Certifications: Add, Update, Delete
# --------------------------------------------------

@router.post("/me/certifications")
def add_my_certification(
    request: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    certification = CertificationRecord(
        candidate_profile_id=profile.id,
        **request.model_dump()
    )

    certification = save_record(
        db, certification, "Certification could not be saved."
    )

    return {
        "message": "Certification saved successfully.",
        "certification": {
            "id": certification.id,
            **request.model_dump(),
        },
    }


@router.put("/me/certifications/{record_id}")
def update_my_certification(
    record_id: int,
    request: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    certification = get_owned_record(
        db, CertificationRecord, record_id, profile.id
    )

    update_record(
        db,
        certification,
        request.model_dump(),
        "Certification could not be updated."
    )

    return {"message": "Certification updated successfully."}


@router.delete("/me/certifications/{record_id}")
def delete_my_certification(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    certification = get_owned_record(
        db, CertificationRecord, record_id, profile.id
    )

    delete_record(
        db, certification, "Certification could not be deleted."
    )

    return {"message": "Certification deleted successfully."}


# --------------------------------------------------
# Languages: Add
# --------------------------------------------------

@router.post("/me/languages")
def add_my_language(
    request: LanguageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_candidate_profile(current_user, db)

    language = LanguageRecord(
        candidate_profile_id=profile.id,
        name=request.name
    )

    language = save_record(
        db, language, "Language could not be saved."
    )

    return {
        "message": "Language saved successfully.",
        "language": {
            "id": language.id,
            "name": language.name,
        },
    }
@router.put("/me/languages/{record_id}")
def update_my_language(
    record_id: int,
    request: LanguageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")

    language = db.query(LanguageRecord).filter(
        LanguageRecord.id == record_id,
        LanguageRecord.candidate_profile_id == profile.id
    ).first()

    if language is None:
        raise HTTPException(status_code=404, detail="Language not found.")

    language.name = request.name

    db.commit()
    db.refresh(language)

    return {
        "message": "Language updated successfully.",
        "language": {"id": language.id, "name": language.name}
    }


@router.delete("/me/languages/{record_id}")
def delete_my_language(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")

    language = db.query(LanguageRecord).filter(
        LanguageRecord.id == record_id,
        LanguageRecord.candidate_profile_id == profile.id
    ).first()

    if language is None:
        raise HTTPException(status_code=404, detail="Language not found.")

    db.delete(language)
    db.commit()

    return {"message": "Language deleted successfully."}