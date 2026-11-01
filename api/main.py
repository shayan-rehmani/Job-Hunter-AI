from pathlib import Path
from tempfile import NamedTemporaryFile
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.job_routes import router as job_router

from services.resume_parser import (
    extract_resume_text,
    extract_resume_links,
)
from services.resume_analyzer import analyze_resume_text
from services.profile_completion import check_profile_completion
from services.profile_onboarding import (
    get_next_question,
    save_profile_answer,
)
from models.resume_profile import ResumeProfile
from auth.routes import router as auth_router
from api.profile_routes import router as profile_router
from api.resume_routes import router as resume_router


app = FastAPI(
    title="Job Hunter AI API",
    description="Resume analysis and candidate onboarding API",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(job_router)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

# Temporary storage for local development.
profile_sessions: dict[str, ResumeProfile] = {}


class AnswerRequest(BaseModel):
    field: str
    answer: str


@app.get("/")
def health_check():
    return {
        "status": "running",
        "application": "Job Hunter AI",
    }


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are supported.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 10 MB limit.",
        )

    temp_path = None

    try:
        with NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        resume_text = extract_resume_text(temp_path)
        resume_links = extract_resume_links(temp_path)

        profile = analyze_resume_text(resume_text, resume_links)

        session_id = str(uuid4())
        profile_sessions[session_id] = profile

        completion = check_profile_completion(profile)
        next_question = get_next_question(profile)

        return {
            "session_id": session_id,
            "status": "processed",
            "profile": profile.model_dump(),
            "completion": completion,
            "next_question": next_question,
        }

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=422, detail=str(error))

    finally:
        if temp_path and Path(temp_path).exists():
            Path(temp_path).unlink()

        await file.close()


@app.get("/profile/{session_id}")
def get_profile(session_id: str):
    profile = profile_sessions.get(session_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile session not found.",
        )

    return {
        "profile": profile.model_dump(),
        "completion": check_profile_completion(profile),
        "next_question": get_next_question(profile),
    }


@app.post("/profile/{session_id}/answer")
def submit_profile_answer(
    session_id: str,
    request: AnswerRequest,
):
    profile = profile_sessions.get(session_id)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile session not found.",
        )

    try:
        save_profile_answer(
            profile,
            request.field,
            request.answer,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))

    completion = check_profile_completion(profile)

    return {
        "message": "Answer saved successfully.",
        "completion": completion,
        "next_question": get_next_question(profile),
    }

app.include_router(auth_router)
