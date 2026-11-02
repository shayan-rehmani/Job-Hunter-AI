# Architecture

## System Overview

Job Hunter AI is a React single-page application backed by a FastAPI service. The backend authenticates users, stores candidate profiles and job records through SQLAlchemy, parses resumes, sends authentication emails, calls external AI/search services, and returns data to the frontend.

    Browser (React + Vite)
           |
           | HTTP + Bearer JWT
           v
    FastAPI application (api.main)
           |
           +-- auth routes ------------ OTP registration, login, password reset
           +-- profile routes --------- Candidate profile and completion
           +-- resume routes ---------- PDF/DOCX upload and analysis
           +-- job routes ------------- Preferences, discovery, saved jobs, status
           |
           +-- SQLAlchemy ------------ SQLite locally / DATABASE_URL for DB
           +-- OTP manager ------------ OTP generation, verification and lifecycle
           +-- Email service ---------- Gmail SMTP delivery
           +-- Resume services -------- pypdf, python-docx, Gemini analysis
           +-- Job search service ----- Tavily discovery + Gemini analysis
           +-- File storage ----------- storage/resumes/<user_id>/

## Frontend

- React + Vite application in frontend/.
- React Router handles login and protected workspace routes.
- Axios centralizes API calls and adds the access token from browser local storage as a Bearer token.
- Main pages: Dashboard, Profile, Resume Manager, Find Jobs, Applications.
- The Axios base URL currently points to the local FastAPI address. Production deployment needs an environment-based API URL.

## Backend

- api/main.py creates the FastAPI application, configures local-development CORS, and includes authentication, profile, resume, and job routers.
- auth/routes.py implements registration OTP request/completion, password login, password-reset OTP request/completion, and current-user retrieval.
- auth/otp_service.py generates six-digit OTPs and hashes them with HMAC-SHA256 using a separately configured pepper.
- auth/otp_manager.py enforces OTP expiry, resend cooldown, verification-attempt limits, and single-use verification.
- services/email_service.py sends registration and password-reset messages through Gmail SMTP.
- auth/security.py handles Argon2 password hashing and JWT creation/verification.
- database/ contains SQLAlchemy engine/session setup and ORM models, including the OTP record model.
- services/ contains resume parsing/analysis, job search, job matching, profile completion, and job persistence.

## Authentication Flows

### Registration

1. The frontend submits an email address to POST /auth/register/request-otp.
2. The backend generates a six-digit OTP, stores its HMAC-SHA256 hash, expiry and attempt metadata, and sends the code through Gmail SMTP.
3. The user submits the email, OTP and password to POST /auth/register/complete.
4. The backend verifies and consumes the OTP, hashes the password with Argon2, and creates the user and candidate profile.

### Login

1. The user submits email and password to POST /auth/login.
2. The backend verifies the password using Argon2.
3. The backend issues a signed HS256 JWT with a 30-minute lifetime.
4. The frontend stores the token in local storage and sends it with protected API requests.

### Password Reset

1. The user submits an email address to POST /auth/forgot-password/request-otp.
2. The backend sends a password-reset OTP when the account is eligible; the response is generic to reduce account enumeration.
3. The user submits email, OTP and new password to POST /auth/forgot-password/reset.
4. The backend verifies and consumes the OTP, hashes the new password with Argon2, and updates the account.

### OTP Lifecycle

- Six-digit codes are generated using a cryptographically secure random generator.
- OTPs are stored as HMAC-SHA256 hashes, not plaintext.
- Default expiry is five minutes.
- Default resend cooldown is 60 seconds.
- Default maximum verification attempts is five.
- Successful verification consumes the OTP.
- Registration and password reset use separate OTP purposes.

## Data Model

A user has one candidate profile. The profile owns related skills, education, experience, projects, certifications, languages, job preferences, and saved jobs. Resume metadata and parsed analysis are associated with the candidate profile. Resume bytes are stored separately in the filesystem.

The OTP model stores email, purpose, OTP hash, expiry, attempt count, send timestamp, consumption timestamp, and creation timestamp.

## Job Discovery Flow

1. The authenticated user configures job preferences and uploads a resume.
2. The user manually starts a search and selects sources and a posting-date range.
3. FastAPI loads the user's resume analysis, location and preferences.
4. Tavily searches public indexed pages for role/location combinations.
5. Gemini filters and structures candidate vacancy results.
6. The backend validates returned source URLs and applies the exact date-range filter.
7. Discovered jobs are saved/upserted for the candidate profile.
8. The frontend loads saved jobs and allows application-status updates.

Tavily results are discovery leads, not a guarantee that a vacancy is open. Users should verify each listing at its destination.

## Database Configuration

The default database URL is sqlite:///./job_hunter.db. Set DATABASE_URL to a PostgreSQL connection string for a PostgreSQL deployment. A production migration strategy and explicit schema initialization procedure must be established before launch, including creation of the OTP table on a fresh database.

## Google ADK

The agent_app/ directory is a Google ADK scaffold. The primary web application's HTTP API is started with uvicorn api.main:app; adk run agent_app is a separate scaffold workflow, not the web server command.
