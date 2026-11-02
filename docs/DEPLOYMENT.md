# Deployment Guide

This guide is a deployment plan, not a claim that the current repository is production-ready.

## Suggested Hosting Layout

- **Frontend:** Vercel or another static hosting provider for the Vite build.
- **Backend:** Render or another Python hosting provider running FastAPI/Uvicorn.
- **Database:** Managed PostgreSQL for durable multi-user data.
- **Resume files:** Private object storage with access controls and backups.

Check provider pricing, free-tier limits, sleep behavior, persistent disk options, region availability and data-processing terms before choosing a plan.

## Required Code and Configuration Work Before Deployment

1. Replace the hard-coded Axios base URL in frontend/src/api/axios.js with import.meta.env.VITE_API_BASE_URL and provide a safe local default.
2. Configure production CORS in api/main.py using an explicit environment variable for allowed frontend origins. Do not use wildcard origins with credentials.
3. Set DATABASE_URL to a managed PostgreSQL connection string. Confirm the SQLAlchemy driver is installed and database schema migrations are in place.
4. Add database migrations (for example, Alembic) before evolving production tables. Ensure a fresh database receives every required table, including the OTP table.
5. Move resume uploads from local storage/resumes to private durable object storage. The current filesystem path is not sufficient for ephemeral application instances.
6. Configure all backend secrets in the hosting dashboard, not in source code or committed files.
7. Configure Gmail SMTP for OTP delivery using a dedicated sender account and an App Password. Do not use a normal Gmail password.
8. Add IP-based and endpoint-level rate limits for login, registration, OTP requests and verification, resume uploads, and job searches.
9. Add a retention and cleanup policy for expired and consumed OTP records.
10. Add monitoring, backups, a tested restore procedure, and a tested account/data deletion process.
11. Review privacy disclosures and third-party provider terms before processing real candidate resumes.

## Backend Service

A typical ASGI start command is:

    uvicorn api.main:app --host 0.0.0.0 --port $PORT

Configure the provider's health-check path as /.

Expected environment variables:

| Variable | Purpose |
|---|---|
| JWT_SECRET_KEY | Strong random JWT signing secret |
| OTP_PEPPER | Separate secret used for OTP HMAC hashing |
| DATABASE_URL | Managed database connection string |
| SMTP_HOST | SMTP server hostname (Gmail: smtp.gmail.com) |
| SMTP_PORT | SMTP port (Gmail STARTTLS: 587) |
| SMTP_USERNAME | SMTP sender account |
| SMTP_PASSWORD | Gmail App Password or provider credential |
| SMTP_FROM_EMAIL | Sender email address |
| OTP_EXPIRE_MINUTES | OTP expiry; default 5 |
| OTP_RESEND_SECONDS | Resend cooldown; default 60 |
| OTP_MAX_ATTEMPTS | Verification attempt limit; default 5 |
| GOOGLE_API_KEY | Gemini API key |
| TAVILY_API_KEY | Tavily API key |

The local development setup uses root .env for authentication and SMTP settings, and agent_app/.env for AI/search credentials. Standardize environment loading for production so hosting-provider environment variables are read consistently. Never put secrets in frontend VITE_* variables.

## Frontend Service

Build command:

    npm install
    npm run build

Output directory: dist (inside frontend/).

Set VITE_API_BASE_URL to the public backend URL after the Axios client is updated to read it. Vite environment variables are embedded in the client bundle; never put secrets in VITE_* variables.

For React Router history fallback, configure the static host to serve index.html for application routes.

## Go-Live Verification

- Register a test account and confirm the email OTP arrives.
- Confirm incorrect, expired, and already-used OTPs are rejected.
- Confirm resend cooldown and maximum-attempt behavior.
- Log in and verify protected routes reject missing or expired tokens.
- Complete a password reset and log in using the new password.
- Upload and retrieve a test resume.
- Save and reload profile and preferences.
- Run a manual job search and verify results persist after refresh.
- Change an application status and verify persistence.
- Confirm user A cannot access user B's profile, resume or jobs.
- Verify resume objects are private and deletion works.
- Verify CORS, HTTPS, database backup and restore.
- Check logs for accidental secrets or personal data.

Do not advertise the service as production-ready until these checks pass.
