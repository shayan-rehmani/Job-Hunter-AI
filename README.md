# Job Hunter AI

An AI-assisted job discovery and application-tracking platform that uses a candidate's resume and job preferences to find relevant public job listings, analyze fit, and keep opportunities organized.

> **Project status:** Local-development MVP. The repository contains a working React + FastAPI application. Production hosting, email OTP verification, password-reset OTP, and fully automated job submission are not yet implemented. Job discovery is manual and application actions remain under the user's control.

## What it does

- Account registration and password-based login using Argon2 password hashing and JWT access tokens.
- Candidate profile management, including skills, education, experience, projects, certifications, and languages.
- PDF and DOCX resume upload, text extraction, and Gemini-powered resume analysis.
- Job-search preferences for titles, locations, experience, job types, sources, salary range, relocation, and availability.
- Manual job discovery using Tavily search and Gemini-based filtering/analysis.
- Posting-date filters: past 24 hours (default), 7 days, 30 days, 90 days, or any time.
- Persistent saved-job records and application-status tracking.
- Dashboard metrics and an Applications page.

Job results depend on public search indexing and the source websites. Discovery is not exhaustive, and a listing's availability should be verified on the employer's or job platform's page.

## Technology

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS v4, React Router, Axios, Lucide |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, Uvicorn |
| Database | SQLite for local development; PostgreSQL can be configured through `DATABASE_URL` |
| AI | Google Gemini API; Google ADK scaffold is also present |
| Search | Tavily |
| Resume processing | pypdf, python-docx |
| Authentication | Argon2 password hashing, JWT (HS256) |

## Repository structure

```text
Job-Hunter-AI/
├── agent_app/              # Google ADK agent scaffold and AI configuration
├── api/                    # FastAPI route modules and schemas
├── auth/                   # Registration, login, JWT and auth dependencies
├── config/                 # AI model configuration
├── database/               # SQLAlchemy connection and models
├── docs/                   # Project documentation
├── frontend/               # React + Vite application
├── models/                 # Resume/profile data models
├── services/               # Resume parsing, AI analysis, job search and storage
├── requirements.txt
├── .env.example
└── README.md
```

## Quick start (Windows CMD)

### 1. Prerequisites

- Python 3.12
- Node.js and npm
- Git
- Google Gemini API key
- Tavily API key

### 2. Clone and set up the backend

```cmd
git clone https://github.com/shayan-rehmani/Job-Hunter-AI.git
cd Job-Hunter-AI

python -m venv .venv
.venv\Scripts\activate.bat

python -m pip install --upgrade pip
pip install -r requirements.txt
pip install tavily-python
```

The current tracked `requirements.txt` does not yet list `tavily-python`, although the job-search service imports it. The extra install command above is therefore required until that dependency is added to the requirements file.

### 3. Configure backend environment variables

Create a root `.env` file from `.env.example` and set a long, random `JWT_SECRET_KEY`.

Create `agent_app/.env` from `agent_app/.env.example` and add your Gemini and Tavily API keys.

Never commit real `.env` files or API keys.

### 4. Start the backend

From the repository root, with the virtual environment active:

```cmd
uvicorn api.main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/

### 5. Start the frontend

Open a **second Windows CMD** window:

```cmd
cd /d path\to\Job-Hunter-AI\frontend
npm install
npm run dev
```

Vite normally serves the app at http://localhost:5173.

**Local API configuration:** The current Axios client points to `http://127.0.0.1:8000`. For a hosted deployment, this must be changed to the deployed API URL and configured through a frontend environment variable before building.

## Authentication and privacy notes

- Registration currently creates an account immediately; email ownership is not verified by OTP yet.
- Login uses email and password. Passwords are hashed with Argon2; JWT access tokens currently expire after 30 minutes.
- Forgot-password OTP and account email-verification flows are planned, not implemented.
- Resume files are stored under `storage/resumes/<user_id>/` in the current local implementation. Treat this directory as sensitive personal data.
- Do not expose the local SQLite database, uploaded resumes, API keys, JWT secret, or user data in GitHub.
- Before public launch, configure production CORS, HTTPS, durable private file storage, database backups, rate limits, and production secrets.

See [Security](docs/SECURITY.md) and [Deployment](docs/DEPLOYMENT.md).

## Documentation

- [Installation and local development](docs/INSTALLATION.md)
- [Features and user workflows](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Security and privacy](docs/SECURITY.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## Important limitations

- Job discovery is initiated manually by the user; it does not run automatically in the background.
- Search results depend on Tavily indexing and Gemini's ability to identify individual vacancies.
- Job posting dates may be unavailable or unparseable. Finite date filters exclude listings without a usable posting date.
- Job sources may change their pages, access rules, or availability. Always confirm details on the destination site.
- The app does not currently create third-party accounts, solve CAPTCHAs, bypass access controls, or submit applications autonomously.
- The separate AI Job Matches navigation page was removed; related backend endpoints remain in the codebase.

## License

No license has been added yet. Until a license is selected and included in this repository, do not assume that the source is available for reuse, redistribution, or commercial use.
