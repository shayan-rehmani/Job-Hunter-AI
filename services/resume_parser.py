
from pathlib import Path
from pypdf import PdfReader
from docx import Document

SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


def extract_resume_text(file_path: str) -> str:
    """Extract text from PDF or DOCX resume files."""

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError("Resume file not found.")

    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError("Only PDF and DOCX files are supported.")

    extracted_text = []

    if extension == ".pdf":
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            raise ValueError("Password-protected PDFs are not supported.")

        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)

    elif extension == ".docx":
        document = Document(str(path))

        for paragraph in document.paragraphs:
            if paragraph.text.strip():
                extracted_text.append(paragraph.text)

        for table in document.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells]
                extracted_text.append(" | ".join(cells))

    result = "\n".join(extracted_text).strip()

    if not result:
        raise ValueError("No readable text found in the resume.")

    return result
