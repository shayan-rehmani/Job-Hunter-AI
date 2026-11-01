
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
def extract_resume_links(file_path: str) -> list[dict]:
    """Extract embedded hyperlinks from PDF and DOCX resumes."""

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError("Resume file not found.")

    extension = path.suffix.lower()
    links = []

    if extension == ".pdf":
        reader = PdfReader(str(path))

        for page in reader.pages:
            annotations = page.get("/Annots", [])

            for annotation_ref in annotations:
                annotation = annotation_ref.get_object()

                if annotation.get("/Subtype") != "/Link":
                    continue

                action = annotation.get("/A")

                if action:
                    action = action.get_object()
                    url = action.get("/URI")

                    if url:
                        links.append({
                            "url": str(url),
                            "source": "PDF hyperlink",
                        })

    elif extension == ".docx":
        document = Document(str(path))

        for relationship in document.part.rels.values():
            if relationship.reltype.endswith("/hyperlink"):
                links.append({
                    "url": relationship.target_ref,
                    "source": "DOCX hyperlink",
                })

    else:
        raise ValueError("Only PDF and DOCX resumes are supported.")

    # Remove duplicate URLs.
    unique_links = []
    seen = set()

    for link in links:
        if link["url"] not in seen:
            seen.add(link["url"])
            unique_links.append(link)

    return unique_links
