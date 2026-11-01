
import json
import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types

from pathlib import Path

from config.ai_config import PRIMARY_MODEL

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / "agent_app" / ".env")



def search_jobs_from_resume(
    resume_analysis: dict,
    location: str | None = None,
    selected_sources: list[str] | None = None,
):
    """Discover current job opportunities using resume data and Google Search."""

    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY was not found.")

    if not resume_analysis:
        raise ValueError("No analyzed resume was found.")

    skills = resume_analysis.get("skills", [])
    experience = resume_analysis.get("experience", [])
    education = resume_analysis.get("education", [])
    projects = resume_analysis.get("projects", [])

    candidate_location = (
        location
        or resume_analysis.get("location")
        or "India"
    )

    sources = selected_sources or [
        "Company Career Pages",
        "LinkedIn",
        "Naukri",
        "Indeed",
        "Foundit",
        "Internshala",
        "Other job platforms",
    ]

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are a job discovery assistant for Job Hunter AI.

Find current, publicly discoverable job opportunities matching
the candidate's resume.

CANDIDATE PROFILE:
{json.dumps(resume_analysis, ensure_ascii=False)}

SEARCH LOCATION:
{candidate_location}

SOURCES TO EXPLORE:
{json.dumps(sources)}

TASK:
1. Discover genuine job vacancies currently accepting applications.
2. Prioritize jobs matching the candidate's actual skills,
   education, projects and experience.
3. Include fresher and entry-level opportunities when appropriate.
4. Include relevant remote opportunities.
5. Search company career pages and the requested job platforms.
6. Prefer official employer application pages.
7. Include third-party application links when available.
8. Never invent companies, vacancies, salaries, dates or URLs.
9. Do not present expired or unverifiable jobs as confirmed active.
10. Do not claim to have searched a platform if its listings
    were not actually found.
11. Do not treat search-result snippets as proof that a vacancy
    is still accepting applications.

Return valid JSON only, using this structure:

{{
  "jobs": [
    {{
      "title": "Job title",
      "company": "Company name",
      "location": "Job location",
      "work_mode": "Remote, Hybrid or On-site",
      "experience_level": "Fresher or required experience",
      "description": "Short job description",
      "required_skills": ["Skill 1", "Skill 2"],
      "posted_date": null,
      "application_status": "Needs verification",
      "match_reasons": ["Reason 1", "Reason 2"],
      "application_url": "URL found in search results",
      "source_name": "Source name"
    }}
  ]
}}

Return an empty jobs list if no relevant opportunities are found.
Do not manufacture application URLs.
"""

    response = client.models.generate_content(
        model=PRIMARY_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
            tools=[
                types.Tool(
                    google_search=types.GoogleSearch()
                )
            ],
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty job search response.")

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as error:
        raise ValueError("Gemini returned invalid job search data.") from error

    if not isinstance(result, dict) or not isinstance(result.get("jobs"), list):
        raise ValueError("Gemini returned an unexpected job search format.")

    # Extract URLs actually present in Google's grounding results.
    grounded_urls = set()
    search_queries = []

    candidates = response.candidates or []

    for candidate in candidates:
        metadata = getattr(candidate, "grounding_metadata", None)

        if not metadata:
            continue

        search_queries.extend(
            getattr(metadata, "web_search_queries", None) or []
        )

        for chunk in getattr(metadata, "grounding_chunks", None) or []:
            web_data = getattr(chunk, "web", None)

            if web_data and getattr(web_data, "uri", None):
                grounded_urls.add(web_data.uri)

    verified_jobs = []

    for job in result["jobs"]:
        if not isinstance(job, dict):
            continue

        url = job.get("application_url")

        # Only keep application URLs present in Google's grounded sources.
        if not isinstance(url, str):
            continue

        if url not in grounded_urls:
            continue

        if not re.match(r"^https://", url, re.IGNORECASE):
            continue

        verified_jobs.append(job)

    return {
        "jobs": verified_jobs,
        "search_queries": list(dict.fromkeys(search_queries)),
        "grounded_sources": sorted(grounded_urls),
        "total_results": len(verified_jobs),
        "location": candidate_location,
    }
