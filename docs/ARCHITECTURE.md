# Architecture

## System overview

Job Hunter AI is a React single-page application backed by a FastAPI service. The backend authenticates users, stores candidate profiles and job records through SQLAlchemy, parses resumes, calls external AI/search services, and returns data to the frontend.

```text
Browser (React + Vite)
       |
       | HTTP + Bearer JWT
       v
FastAPI application (api.main)
       |
       +-- auth routes ------------ User registration, login, current user
       +-- profile routes --------- Candidate profile and completion
       +-- resume routes ---------- PDF/DOCX upload and analysis
       +-- job routes ------------- Preferences, discovery, saved jobs, status
       |
       +-- SQLAlchemy ------------ SQLite locally / DATABASE_URL for DB
       +-- Resume services -------- pypdf, python-docx, Gemini analysis
       +-- Job search service ----- Tavily discovery + Gemini analysis
       +-- File storage ----------- storage/resumes/<user_id>/
```

## Frontend

- React + Vite application in `frontend/`.
- React Router handles login and protected workspace routes.
- Axios centralizes API calls and adds the access token from browser local storage as a Bearer token.
- Main pages: Dashboard, Profile, Resume Manager, Find Jobs, Applications.
- The Axios base URL is currently hard-coded to the local FastAPI address. Production deployment needs an environment-based API URL.

## Backend

- `api/main.py` creates the FastAPI application, configures local-development CORS, and includes authentication, profile, resume, and job routers.
- `auth/` handles registration, login, password hashing, JWT creation and current-user dependencies.
- `database/` contains SQLAlchemy engine/session setup and ORM models.
- `services/` contains resume parsing/analysis, job search, job matching, profile completion, and job persistence.

## Data model

A user has one candidate profile. The profile owns related skills, education, experience, projects, certifications, languages, job preferences, and saved jobs. Resume metadata and parsed analysis are associated with the candidate profile. Resume bytes are stored separately in the filesystem.

The current ORM relationship from User to CandidateProfile uses delete-orphan cascading. The CandidateProfile relationships also cascade to many profile child records and jobs.

## Job discovery flow

1. The authenticated user configures job preferences and uploads a resume.
2. The user manually starts a search and selects sources and a posting-date range.
3. FastAPI loads the user's resume analysis, location and preferences.
4. Tavily searches public indexed pages for role/location combinations.
5. Gemini filters and structures candidate vacancy results.
6. The backend validates returned source URLs and applies the exact date-range filter.
7. Discovered jobs are saved/upserted for the candidate profile.
8. The frontend loads saved jobs and allows application-status updates.

Tavily results are discovery leads, not a guarantee that a vacancy is open. Users should verify each listing at its destination.

## Authentication flow (current implementation)

1. Registration accepts an email and password.
2. Passwords are hashed with Argon2 before database storage.
3. Login verifies the password and returns a signed HS256 JWT.
4. The frontend stores the token in local storage and sends it on API requests.
5. Protected backend routes validate the token and resolve the current user.

Email OTP verification and OTP-based password reset are not implemented in the current version.

## Database configuration

The default database URL is `sqlite:///./job_hunter.db`. Set `DATABASE_URL` to a PostgreSQL connection string for a PostgreSQL deployment. Production migrations and database lifecycle procedures should be established before launch.

## Google ADK

The `agent_app/` directory is a Google ADK scaffold. The primary web application's HTTP API is started with `uvicorn api.main:app`; `adk run agent_app` is a separate scaffold workflow, not the web server command.
