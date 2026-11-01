from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, HTTPException, UploadFile

from services.resume_parser import extract_resume_text

app = FastAPI(
    title="Job Hunter AI API",
    description="Resume upload and processing API",
    version="0.1.0",
)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@app.get("/")
def health_check():
    return {"status": "running", "application": "Job Hunter AI"}


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
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")

    temp_path = None

    try:
        with NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        resume_text = extract_resume_text(temp_path)

        return {
            "filename": Path(file.filename or "resume").name,
            "status": "processed",
            "characters_extracted": len(resume_text),
            "resume_text": resume_text,
        }

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=422, detail=str(error))

    finally:
        if temp_path and Path(temp_path).exists():
            Path(temp_path).unlink()

        await file.close()