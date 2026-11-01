from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import CandidateProfile
from auth.dependencies import get_current_user
from database.models import User, Skill, EducationRecord, ExperienceRecord, ProjectRecord, CertificationRecord, LanguageRecord
from api.profile_schemas import ProfileUpdate, ProfileResponse, SkillsUpdate, EducationCreate, ExperienceCreate, ProjectCreate, CertificationCreate, LanguageCreate

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])


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
        "education": [{"id": e.id, "qualification_level": e.qualification_level, "degree": e.degree, "institution": e.institution, "board_or_university": e.board_or_university, "stream": e.stream, "specialization": e.specialization, "start_year": e.start_year, "end_year": e.end_year, "passing_year": e.passing_year, "grade": e.grade, "grade_type": e.grade_type} for e in profile.education_records],
        "experience": [{"id": e.id, "job_title": e.job_title, "company": e.company, "location": e.location, "start_date": e.start_date, "end_date": e.end_date, "responsibilities": e.responsibilities} for e in profile.experience_records],
        "projects": [{"id": p.id, "name": p.name, "description": p.description, "technologies": p.technologies} for p in profile.projects],
        "certifications": [{"id": c.id, "name": c.name, "issuing_organization": c.issuing_organization, "date": c.date} for c in profile.certifications],
        "languages": [item.name for item in profile.languages]
    }


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    return serialize_profile(profile, current_user)


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(request: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return serialize_profile(profile, current_user)

@router.get("/me/completion")
def get_my_profile_completion(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    required = {"full_name": bool(profile.full_name and profile.full_name.strip()), "date_of_birth": bool(profile.date_of_birth), "email": bool(current_user.email), "phone": bool(profile.phone), "location": bool(profile.location), "skills": bool(profile.skills), "education": bool(profile.education_records)}
    missing = [field for field, completed in required.items() if not completed]
    completed_count = len(required) - len(missing)
    return {"is_complete": len(missing) == 0, "completion_percentage": round(completed_count / len(required) * 100), "completed_fields": [field for field, completed in required.items() if completed], "missing_required": missing}

@router.post("/me/skills")
def update_my_skills(request: SkillsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    try:
        profile.skills.clear()
        for name in request.skills:
            profile.skills.append(Skill(name=name))
        db.commit()
        db.refresh(profile)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Skills could not be saved.")
    return {"message": "Skills saved successfully.", "skills": [item.name for item in profile.skills]}



@router.post("/me/education")
def add_my_education(request: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    try:
        education = EducationRecord(candidate_profile_id=profile.id, **request.model_dump())
        db.add(education)
        db.commit()
        db.refresh(education)
        return {"message": "Education saved successfully.", "education": {"id": education.id, **request.model_dump()}}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Education could not be saved.")


@router.post("/me/experience")
def add_my_experience(request: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    if not request.job_title and not request.company:
        raise HTTPException(status_code=422, detail="Provide at least a job title or company.")
    try:
        experience = ExperienceRecord(candidate_profile_id=profile.id, **request.model_dump())
        db.add(experience)
        db.commit()
        db.refresh(experience)
        return {"message": "Experience saved successfully.", "experience": {"id": experience.id, **request.model_dump()}}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Experience could not be saved.")


@router.post("/me/projects")
def add_my_project(request: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    try:
        project = ProjectRecord(candidate_profile_id=profile.id, **request.model_dump())
        db.add(project)
        db.commit()
        db.refresh(project)
        return {"message": "Project saved successfully.", "project": {"id": project.id, **request.model_dump()}}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Project could not be saved.")


@router.post("/me/certifications")
def add_my_certification(request: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    try:
        certification = CertificationRecord(candidate_profile_id=profile.id, **request.model_dump())
        db.add(certification)
        db.commit()
        db.refresh(certification)
        return {"message": "Certification saved successfully.", "certification": {"id": certification.id, **request.model_dump()}}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Certification could not be saved.")


@router.post("/me/languages")
def add_my_language(request: LanguageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    try:
        language = LanguageRecord(candidate_profile_id=profile.id, name=request.name)
        db.add(language)
        db.commit()
        db.refresh(language)
        return {"message": "Language saved successfully.", "language": {"id": language.id, "name": language.name}}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Language could not be saved.")
