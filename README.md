# Job Hunter AI

An AI-assisted job discovery and application-tracking platform that uses a candidate's resume and job preferences to find relevant public job listings, analyze fit, and keep opportunities organized.

> **Project status:** Local-development MVP. The repository contains a working React + FastAPI application with email OTP registration, password-based login, and OTP-based password reset. Production hosting and fully automated job submission are not yet implemented. Job discovery is manual and application actions remain under the user's control.
> **Project status:** Local-development MVP. The repository contains a working React + FastAPI application with email OTP registration, password-based login, and OTP-based password reset. Production hosting and fully automated job submission are not yet implemented. Job discovery is manual and application actions remain under the user's control.

## What It Does
## What It Does

- Secure account registration using email OTP verification.
- Password-based login with Argon2 password hashing and JWT authentication.
- Forgot-password recovery through email OTP verification.
- Secure account registration using email OTP verification.
- Password-based login with Argon2 password hashing and JWT authentication.
- Forgot-password recovery through email OTP verification.
- Candidate profile management, including skills, education, experience, projects, certifications, and languages.
- PDF and DOCX resume upload, text extraction, and Gemini-powered resume analysis.
- Job-search preferences for titles, locations, experience, job types, sources, salary range, relocation, and availability.
- Manual job discovery using Tavily search and Gemini-based filtering and analysis.
- Manual job discovery using Tavily search and Gemini-based filtering and analysis.
- Posting-date filters: past 24 hours (default), 7 days, 30 days, 90 days, or any time.
- Persistent saved-job records and application-status tracking.
- Dashboard metrics and an Applications page.

Job results depend on public search indexing and source websites. Discovery is not exhaustive, and listing availability should be verified on the employer's or job platform's page.
Job results depend on public search indexing and source websites. Discovery is not exhaustive, and listing availability should be verified on the employer's or job platform's page.

## Technology Stack
## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS v4, React Router, Axios, Lucide |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, Uvicorn |
| Database | SQLite for local development; PostgreSQL can be configured through `DATABASE_URL` |
| AI | Google Gemini API, Google ADK |
| Search | Tavily |
| Resume Processing | pypdf, python-docx |
| Authentication | Gmail SMTP, HMAC-SHA256 OTP hashing, Argon2 password hashing, JWT (HS256) |
| Resume Processing | pypdf, python-docx |
| Authentication | Gmail SMTP, HMAC-SHA256 OTP hashing, Argon2 password hashing, JWT (HS256) |

## Repository Structure
## Repository Structure

```text
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
```

## Quick Start (Windows CMD)
## Quick Start (Windows CMD)

### 1. Prerequisites

- Python 3.12
- Node.js and npm
- Git
- Google Gemini API key
- Tavily API key
- Gmail account configured with 2-Step Verification and an App Password
- Gmail account configured with 2-Step Verification and an App Password

### 2. Clone and Set Up the Backend
### 2. Clone and Set Up the Backend

    git clone https://github.com/shayan-rehmani/Job-Hunter-AI.git
    cd Job-Hunter-AI

    python -m venv .venv
    .venv\Scripts\activate.bat

python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a root `.env` file by copying `.env.example`:

```cmd
copy .env.example .env
```

Configure the following variables in the root `.env` file:

```env
# Application security
JWT_SECRET_KEY=your_long_random_jwt_secret
OTP_PEPPER=your_separate_random_otp_secret

# Database
DATABASE_URL=sqlite:///./job_hunter.db

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_support_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM_EMAIL=your_support_email@gmail.com

# OTP configuration
OTP_EXPIRE_MINUTES=5
OTP_RESEND_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

Use a separate random secret for `JWT_SECRET_KEY` and `OTP_PEPPER`.

For Gmail SMTP:

1. Enable 2-Step Verification on your Google account.
2. Generate an App Password from Google Account settings.
3. Use that App Password as `SMTP_PASSWORD`.
4. Never commit your actual `.env` file or share its credentials.

Create `agent_app/.env` from `agent_app/.env.example` and configure your Gemini and Tavily API keys there.

### 4. Start the Backend
### 4. Start the Backend

From the repository root, with the virtual environment activated:
From the repository root, with the virtual environment activated:

```cmd
python -m uvicorn api.main:app --reload
```

Backend URLs:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/

### 5. Start the Frontend
### 5. Start the Frontend

Open a second Windows CMD window:
Open a second Windows CMD window:

```cmd
cd /d path\to\Job-Hunter-AI\frontend

npm install
npm run dev
```

Vite normally serves the application at:

http://localhost:5173

**Local API configuration:** The current Axios client points to `http://127.0.0.1:8000`. For hosted deployment, configure the deployed API URL through a frontend environment variable before building.

## Authentication System

Job Hunter AI uses email verification and password-based authentication.

### Registration Flow

1. User enters an email address.
2. Backend generates a six-digit OTP.
3. OTP is sent through Gmail SMTP.
4. User enters the received OTP.
5. Backend verifies the OTP.
6. User creates a password.
7. Account and candidate profile are created.

### Login Flow

1. User enters their registered email and password.
2. Backend verifies the password using Argon2.
3. Backend generates a signed JWT access token.
4. Frontend stores the access token and accesses protected routes.

### Forgot Password Flow

1. User enters their registered email address.
2. Backend sends a password-reset OTP.
3. User verifies the OTP.
4. User enters and confirms a new password.
5. Backend updates the password hash.
6. User can log in using the new password.

### OTP Security

- Six-digit randomly generated OTPs.
- OTPs stored as HMAC-SHA256 hashes, not plaintext.
- Five-minute OTP expiration by default.
- Sixty-second resend cooldown.
- Maximum of five verification attempts.
- Single-use OTP verification.
- Separate OTP purposes for registration and password reset.
- OTP pepper stored in the environment configuration.

### Authentication API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register/request-otp` | Request registration OTP |
| POST | `/auth/register/complete` | Verify OTP and create account |
| POST | `/auth/login` | Authenticate and receive JWT |
| POST | `/auth/forgot-password/request-otp` | Request password-reset OTP |
| POST | `/auth/forgot-password/reset` | Verify OTP and reset password |
| GET | `/auth/me` | Retrieve authenticated user |

## Important Security and Privacy Notes

- Passwords are hashed using Argon2 through pwdlib.
- JWT tokens use HS256 and currently expire after 30 minutes.
- SMTP credentials, JWT secrets, and OTP pepper must remain in the root `.env` file.
- OTP records are stored in the database and should be protected.
- Resume files are stored under `storage/resumes/<user_id>/` in the current local implementation.
- Treat uploaded resumes and candidate information as sensitive personal data.
- Never expose the local SQLite database, uploaded resumes, API keys, JWT secrets, or user data in GitHub.

Before public launch, configure production CORS, HTTPS, durable private file storage, database backups, additional rate limiting, and production secrets management.

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
## Important Limitations

- Job discovery is initiated manually; it does not run automatically in the background.
- Search results depend on Tavily indexing and Gemini's ability to identify individual vacancies.
- Job posting dates may be unavailable or unparseable. Finite date filters exclude listings without a usable posting date.
- Job sources may change their pages, access rules, or availability. Always confirm details on the destination site.
- The application does not currently create third-party accounts, solve CAPTCHAs, bypass access controls, or submit applications autonomously.
- The separate AI Job Matches navigation page was removed; related backend endpoints remain in the codebase.
- Production hosting and production-grade email delivery infrastructure are not yet configured.

## License

No license has been added yet. Until a license is selected and included in this repository, do not assume that the source is available for reuse, redistribution, or commercial use.