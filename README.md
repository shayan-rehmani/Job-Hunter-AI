# Job Hunter AI

An AI-assisted job discovery and application-tracking platform that uses a candidate's resume and job preferences to find relevant public job listings, analyze fit, and keep opportunities organized.

> **Project status:** Local-development MVP. The repository contains a working React + FastAPI application with email OTP registration, password-based login, and OTP-based password reset. Production hosting and fully automated job submission are not yet implemented. Job discovery is manual and application actions remain under the user's control.

## What It Does

- Secure account registration using email OTP verification.
- Password-based login with Argon2 password hashing and JWT authentication.
- Forgot-password recovery through email OTP verification.
- Candidate profile management, including skills, education, experience, projects, certifications, and languages.
- PDF and DOCX resume upload, text extraction, and Gemini-powered resume analysis.
- Job-search preferences for titles, locations, experience, job types, sources, salary range, relocation, and availability.
- Manual job discovery using Tavily search and Gemini-based filtering and analysis.
- Posting-date filters: past 24 hours (default), 7 days, 30 days, 90 days, or any time.
- Persistent saved-job records and application-status tracking.
- Dashboard metrics and an Applications page.

Job results depend on public search indexing and source websites. Discovery is not exhaustive, and listing availability should be verified on the employer's or job platform's page.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS v4, React Router, Axios, Lucide |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, Uvicorn |
| Database | SQLite for local development; PostgreSQL can be configured through DATABASE_URL |
| AI | Google Gemini API, Google ADK scaffold |
| Search | Tavily |
| Resume Processing | pypdf, python-docx |
| Authentication | Gmail SMTP, HMAC-SHA256 OTP hashing, Argon2 password hashing, JWT (HS256) |

## Repository Structure

    Job-Hunter-AI/
    ├── agent_app/              # Google ADK agent scaffold and AI configuration
    ├── api/                    # FastAPI route modules and schemas
    ├── auth/                   # Registration, OTP, login and JWT authentication
    ├── config/                 # AI model configuration
    ├── database/               # SQLAlchemy connection and models
    ├── docs/                   # Project documentation
    ├── frontend/               # React + Vite application
    ├── models/                 # Resume/profile data models
    ├── services/               # Resume parsing, AI analysis, email and job search
    ├── storage/                # Local resume storage
    ├── requirements.txt
    ├── .env.example
    └── README.md

## Quick Start (Windows CMD)

### 1. Prerequisites

- Python 3.12
- Node.js and npm
- Git
- Google Gemini API key
- Tavily API key
- Gmail account configured with 2-Step Verification and an App Password

### 2. Clone and Set Up the Backend

    git clone https://github.com/shayan-rehmani/Job-Hunter-AI.git
    cd Job-Hunter-AI

    python -m venv .venv
    .venv\Scripts\activate.bat

    python -m pip install --upgrade pip
    pip install -r requirements.txt

### 3. Configure Environment Variables

Copy the root example file:

    copy .env.example .env

Configure the root .env file with unique random values for JWT_SECRET_KEY and OTP_PEPPER, plus your Gmail SMTP credentials.

For Gmail SMTP:
1. Enable 2-Step Verification on your Google account.
2. Generate a Google App Password.
3. Set it as SMTP_PASSWORD.
4. Never commit the real .env file or share its credentials.

Create agent_app/.env from agent_app/.env.example and configure your Gemini and Tavily API keys.

### 4. Start the Backend

From the repository root, with the virtual environment activated:

    python -m uvicorn api.main:app --reload

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/

### 5. Start the Frontend

Open a second Windows CMD window:

    cd /d path\to\Job-Hunter-AI\frontend
    npm install
    npm run dev

Vite normally serves the application at http://localhost:5173.

**Local API configuration:** The current Axios client points to http://127.0.0.1:8000. For hosted deployment, configure the deployed API URL through a frontend environment variable before building.

## Authentication System

### Registration

1. User enters an email address.
2. Backend generates a six-digit OTP and sends it through Gmail SMTP.
3. User verifies the OTP.
4. User sets a password.
5. Backend creates the account and candidate profile.

### Login

1. User enters their registered email and password.
2. Backend verifies the password using Argon2.
3. Backend issues a signed HS256 JWT access token.
4. The frontend sends the token with protected API requests.

### Forgot Password

1. User requests a password-reset OTP using their email address.
2. Backend sends the OTP through Gmail SMTP when the account is eligible.
3. User verifies the OTP and submits a new password.
4. Backend updates the Argon2 password hash.

### OTP Security Defaults

| Setting | Default |
|---|---:|
| OTP length | 6 digits |
| OTP expiry | 5 minutes |
| Resend cooldown | 60 seconds |
| Maximum verification attempts | 5 |
| Storage | HMAC-SHA256 hash |
| Use | Single-use after successful verification |

These settings can be configured using the environment variables documented in .env.example.

### Authentication API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register/request-otp | Request registration OTP |
| POST | /auth/register/complete | Verify OTP and create account |
| POST | /auth/login | Authenticate and receive JWT |
| POST | /auth/forgot-password/request-otp | Request password-reset OTP |
| POST | /auth/forgot-password/reset | Verify OTP and reset password |
| GET | /auth/me | Retrieve authenticated user |

## Security and Privacy

- Passwords are hashed using Argon2 through pwdlib.
- JWT access tokens use HS256 and currently expire after 30 minutes.
- OTP codes are stored as HMAC-SHA256 hashes, expire after five minutes by default, and are consumed after successful verification.
- SMTP credentials, JWT secrets, and OTP pepper must remain in the root .env file.
- Resume files are stored under storage/resumes/<user_id>/ in the current local implementation.
- Treat uploaded resumes and candidate information as sensitive personal data.
- Never expose the local SQLite database, uploaded resumes, API keys, JWT secrets, or user data in GitHub.

Before public launch, configure HTTPS, production CORS, durable private file storage, database backups, IP-based and endpoint rate limiting, production secrets management, and monitoring. Email OTP currently has per-email resend cooldown and per-code attempt limits; this is not a substitute for broader abuse protection.

See [Security](docs/SECURITY.md) and [Deployment](docs/DEPLOYMENT.md).

## Documentation

- [Installation and local development](docs/INSTALLATION.md)
- [Features and user workflows](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Security and privacy](docs/SECURITY.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## Important Limitations

- Job discovery is initiated manually; it does not run automatically in the background.
- Search results depend on Tavily indexing and Gemini's ability to identify individual vacancies.
- Finite posting-date filters exclude listings without a usable posting date.
- Always verify job details and availability on the destination website.
- The application does not create third-party accounts, solve CAPTCHAs, bypass access controls, or submit applications autonomously.
- The separate AI Job Matches navigation page was removed; related backend endpoints remain in the codebase.
- Production hosting and production-grade email delivery infrastructure are not yet configured.
- OTP records require an appropriate retention and cleanup policy before public launch.

## License

No license has been added yet. Until a license is selected and included in this repository, do not assume that the source is available for reuse, redistribution, or commercial use.
