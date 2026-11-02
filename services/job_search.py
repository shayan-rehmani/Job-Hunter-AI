
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from tavily import TavilyClient
from google import genai
from google.genai import types, errors

from config.ai_config import PRIMARY_MODEL, BACKUP_MODEL


logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / "agent_app" / ".env")


# --------------------------------------------------
# JOB SOURCES
# --------------------------------------------------

SOURCE_DOMAINS = {
    "LinkedIn": ["linkedin.com"],
    "Naukri": ["naukri.com"],
    "Indeed": ["indeed.com"],
    "Foundit": ["foundit.in"],
    "Internshala": ["internshala.com"],
}

DIRECT_CAREER_DOMAINS = [
    "myworkdayjobs.com",
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "smartrecruiters.com",
    "workable.com",
]

EXCLUDED_PATHS = [
    "/posts/",
    "/activity/",
    "/feed/",
    "/videos/",
    "/video/",
    "/company/",
    "/companies/",
    "/search",
    "/jobs-in-",
    "/job-search",
]

DEFAULT_SOURCES = [
    "Company Career Pages",
    "LinkedIn",
    "Naukri",
    "Indeed",
    "Foundit",
    "Internshala",
    "Other job platforms",
]


# --------------------------------------------------
# SOURCE IDENTIFICATION
# --------------------------------------------------

def get_domain(url: str) -> str:
    return (
        urlparse(url)
        .netloc.lower()
        .split(":")[0]
        .removeprefix("www.")
    )


def get_source_name(url: str) -> str:
    domain = get_domain(url)

    for source, domains in SOURCE_DOMAINS.items():
        if any(
            domain == item or domain.endswith("." + item)
            for item in domains
        ):
            return source

    if any(
        domain == item or domain.endswith("." + item)
        for item in DIRECT_CAREER_DOMAINS
    ):
        return "Company Career Pages"

    return "Other job platforms"


def is_valid_job_url(url: str) -> bool:
    parsed = urlparse(url)

    if parsed.scheme != "https" or not parsed.netloc:
        return False

    domain = parsed.netloc.lower()
    path = parsed.path.lower()

    if any(excluded in path for excluded in EXCLUDED_PATHS):
        return False

    excluded_domains = [
        "youtube.com",
        "youtu.be",
        "facebook.com",
        "instagram.com",
    ]

    if any(item in domain for item in excluded_domains):
        return False

    return True


# --------------------------------------------------
# RESUME AND PREFERENCE PROCESSING
# --------------------------------------------------

def build_preferences(
    resume_analysis: dict,
    job_preferences: dict | None,
):
    preferences = job_preferences or {}

    titles = (
        preferences.get("preferred_job_titles")
        or resume_analysis.get("preferred_job_titles")
        or resume_analysis.get("target_roles")
        or ["Data Analyst", "Junior Data Analyst"]
    )

    if isinstance(titles, str):
        titles = [titles]

    titles = [
        str(title).strip()
        for title in titles
        if str(title).strip()
    ][:4]

    locations = preferences.get("preferred_locations") or []

    if isinstance(locations, str):
        locations = [locations]

    if not locations:
        locations = [
            resume_analysis.get("location") or "India"
        ]

    locations = [
        str(item).strip()
        for item in locations
        if str(item).strip()
    ][:3]

    skills = resume_analysis.get("skills") or []

    if not isinstance(skills, list):
        skills = []

    skills = [str(skill) for skill in skills[:12]]

    return preferences, titles, locations, skills


# --------------------------------------------------
# GEMINI MODEL FALLBACK
# --------------------------------------------------

def generate_job_analysis(client, prompt: str) -> dict:
    """Generate job analysis with automatic Gemini model fallback."""

    models_to_try = list(dict.fromkeys([PRIMARY_MODEL, BACKUP_MODEL]))
    last_error = None

    for model_name in models_to_try:
        try:
            logger.info(
                "Analyzing jobs using model: %s",
                model_name,
            )

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )

            if not response.text:
                raise ValueError("Gemini returned an empty response.")

            analysis = json.loads(response.text)

            if not isinstance(analysis, dict):
                raise ValueError(
                    "Gemini returned an unexpected job format."
                )

            logger.info(
                "Job analysis successful using %s",
                model_name,
            )

            return analysis

        except errors.APIError as error:
            error_code = getattr(error, "code", None)
            last_error = error

            if error_code not in (429, 500, 502, 503, 504):
                raise

            logger.warning(
                "Gemini model %s returned HTTP %s. "
                "Trying next model.",
                model_name,
                error_code,
            )

    logger.error("All configured Gemini models failed.")

    raise RuntimeError(
        "Gemini job analysis failed for all configured models. "
        "Please try again later."
    ) from last_error


# --------------------------------------------------
# JOB SEARCH
# --------------------------------------------------

def search_jobs_from_resume(
    resume_analysis: dict,
    location: str | None = None,
    selected_sources: list[str] | None = None,
    job_preferences: dict | None = None,
):
    """
    Discover public job listings using Tavily
    and rank them against the candidate's resume using Gemini.
    """

    tavily_key = os.getenv("TAVILY_API_KEY")
    google_key = os.getenv("GOOGLE_API_KEY")

    if not tavily_key:
        raise RuntimeError("TAVILY_API_KEY was not found.")

    if not google_key:
        raise RuntimeError("GOOGLE_API_KEY was not found.")

    if not isinstance(resume_analysis, dict) or not resume_analysis:
        raise ValueError("No analyzed resume was found.")

    preferences, job_titles, locations, skills = build_preferences(
        resume_analysis,
        job_preferences,
    )

    if location and not preferences.get("preferred_locations"):
        locations = [location]

    sources = selected_sources if selected_sources else DEFAULT_SOURCES

    if not isinstance(sources, list):
        raise ValueError("Selected sources must be a list.")

    supported_sources = set(DEFAULT_SOURCES)

    sources = [
        source for source in sources
        if source in supported_sources
    ]

    if not sources:
        sources = DEFAULT_SOURCES

    # --------------------------------------------------
    # INITIALIZE TAVILY
    # --------------------------------------------------

    try:
        tavily = TavilyClient(api_key=tavily_key)
    except Exception as error:
        raise RuntimeError(
            "Could not initialize Tavily."
        ) from error

    # --------------------------------------------------
    # STEP 1: SEARCH EACH ROLE AND LOCATION
    # --------------------------------------------------

    queries = []

    for title in job_titles:
        for job_location in locations:
            query = (
                f'"{title}" vacancy hiring application '
                f'{job_location} '
                "fresher OR entry level OR internship"
            )

            queries.append(query)

    all_results = {}

    for query in queries:
        try:
            response = tavily.search(
                query=query,
                search_depth="advanced",
                topic="general",
                max_results=8,
                include_answer=False,
                include_raw_content=False,
            )

            for item in response.get("results", []):
                url = item.get("url")

                if not isinstance(url, str):
                    continue

                if not is_valid_job_url(url):
                    continue

                source_name = get_source_name(url)

                if source_name not in sources:
                    continue

                all_results[url] = {
                    "title": item.get("title") or "",
                    "url": url,
                    "content": item.get("content") or "",
                    "published_date": item.get("published_date"),
                    "source_name": source_name,
                }

        except Exception:
            logger.exception(
                "Tavily search failed for query: %s",
                query,
            )

    candidates = list(all_results.values())

    if not candidates:
        return {
            "jobs": [],
            "search_queries": queries,
            "grounded_sources": [],
            "total_results": 0,
            "location": locations[0] if locations else None,
            "search_message": "No suitable job listing pages were found.",
        }

    # --------------------------------------------------
    # STEP 2: GEMINI JOB MATCHING
    # --------------------------------------------------

    prompt = f"""
You are the job matching engine for Job Hunter AI.

Identify genuine individual job vacancies from the
supplied search results and rank them against the candidate's resume.

CANDIDATE RESUME:
{json.dumps(resume_analysis, ensure_ascii=False)}

JOB PREFERENCES:
{json.dumps(preferences, ensure_ascii=False)}

SEARCHED LOCATIONS:
{json.dumps(locations, ensure_ascii=False)}

SELECTED SOURCES:
{json.dumps(sources, ensure_ascii=False)}

CANDIDATE SKILLS:
{json.dumps(skills, ensure_ascii=False)}

RETRIEVED PAGES:
{json.dumps(candidates, ensure_ascii=False)}

STRICT RULES:

1. Return only individual job vacancy pages.
2. Reject general job-search pages, category pages, directories,
   social posts, articles, videos and company homepages.
3. Reject pages that do not describe a specific vacancy.
4. Company must be identifiable from supplied page title or content.
5. Never invent companies, job titles, salary, dates or requirements.
6. Use only exact URLs supplied in the search results.
7. Use the supplied result index as result_index.
8. Do not create or modify URLs.
9. Use null when posting date or work mode is unavailable.
10. Do not claim that a vacancy is currently open unless
    the supplied content explicitly supports it.
11. Prefer relevant fresher, entry-level and internship positions.
12. Explain the match using actual candidate skills and
    supplied vacancy information.
13. Do not treat social media hiring announcements
    as individual job listings.
14. Preserve the source_name associated with each result.
15. Return an empty list if the evidence is insufficient.
16. Keep descriptions concise and factual.

17. SKILL EXTRACTION RULES:
    - Extract technical and professional skills explicitly
      mentioned in the supplied job title or page content.
    - Include both required and preferred skills.
    - Do not invent or assume skills based on the job title.
    - Do not use candidate resume skills as job requirements.
    - Use concise, recognizable skill names.
    - Remove duplicate skills.
    - If no skills are explicitly mentioned, return [].
    - Do not infer skills from company name or industry.

18. Match explanations must be grounded in supplied evidence.

Return valid JSON only:

{{
    "jobs": [
        {{
            "result_index": 0,
            "title": "Exact job title",
            "company": "Identifiable company",
            "location": "Location or null",
            "work_mode": "Remote, Hybrid, On-site or null",
            "experience_level": "Experience requirement or null",
            "description": "Short factual summary",
            "required_skills": [],
            "posted_date": null,
            "match_reasons": []
        }}
    ]
}}
"""

    try:
        client = genai.Client(api_key=google_key)
        analysis = generate_job_analysis(client, prompt)

    except Exception as error:
        logger.exception("Gemini job analysis failed")

        raise RuntimeError(
            f"Gemini job analysis failed: {error}"
        ) from error

    if (
        not isinstance(analysis, dict)
        or not isinstance(analysis.get("jobs"), list)
    ):
        raise ValueError("Gemini returned an unexpected job format.")

    # --------------------------------------------------
    # STEP 3: VALIDATE AND FORMAT RESULTS
    # --------------------------------------------------

    accepted_jobs = []
    seen_urls = set()

    for job in analysis["jobs"]:
        if not isinstance(job, dict):
            continue

        index = job.get("result_index")

        if not isinstance(index, int) or isinstance(index, bool):
            continue

        if index < 0 or index >= len(candidates):
            continue

        candidate = candidates[index]
        url = candidate["url"]

        if url in seen_urls:
            continue

        title = job.get("title")
        company = job.get("company")

        if not isinstance(title, str) or not title.strip():
            logger.warning("Skipping result without a valid job title.")
            continue

        if not isinstance(company, str) or not company.strip():
            logger.warning(
                "Skipping result without an identifiable company: %s",
                url,
            )
            continue

        seen_urls.add(url)

        source_name = candidate["source_name"]
        is_employer_direct = source_name == "Company Career Pages"

        employer_url = url if is_employer_direct else None
        third_party_url = None if is_employer_direct else url

        required_skills = job.get("required_skills") or []

        if not isinstance(required_skills, list):
            required_skills = []

        required_skills = list(dict.fromkeys(
            str(skill).strip()
            for skill in required_skills
            if isinstance(skill, str) and skill.strip()
        ))

        match_reasons = job.get("match_reasons") or []

        if not isinstance(match_reasons, list):
            match_reasons = []

        verified_timestamp = datetime.now(timezone.utc).isoformat()

        # These keys are intentionally provided in both formats
        # to support the database service and frontend.

        accepted_jobs.append({
            "title": title.strip(),
            "company": company.strip(),

            "location": job.get("location"),
            "work_mode": job.get("work_mode"),
            "experience_level": job.get("experience_level"),

            "description": (
                job.get("description")
                or candidate["content"][:500]
            ),

            "required_skills": required_skills,

            "posted_date": (
                job.get("posted_date")
                or candidate.get("published_date")
            ),

            "match_reasons": match_reasons,

            # Original application URL
            "application_url": url,

            # Database-compatible employer URL
            "employer_url": employer_url,

            # Frontend-compatible employer URL
            "employer_application_url": employer_url,

            # Third-party application URL
            "third_party_application_url": third_party_url,

            # Source information
            "source_name": source_name,

            "source_type": (
                "Employer Direct"
                if is_employer_direct
                else "Third-party"
            ),

            # Application status
            "application_status": "Needs verification",

            # Verification timestamps
            "last_checked_at": verified_timestamp,
            "last_verified_at": verified_timestamp,
        })

    # --------------------------------------------------
    # STEP 4: FINAL RESPONSE
    # --------------------------------------------------

    return {
        "jobs": accepted_jobs,
        "search_queries": queries,

        "grounded_sources": [
            job["application_url"]
            for job in accepted_jobs
        ],

        "total_results": len(accepted_jobs),

        "location": locations[0] if locations else None,

        "search_message": (
            "Job discovery completed."
            if accepted_jobs
            else "No individual job listings passed the quality checks."
        ),
    }
