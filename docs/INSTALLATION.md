# Installation and Local Development

These instructions target Windows CMD and the current repository layout.

## Prerequisites

- Python 3.12
- Node.js with npm
- Git
- Google Gemini API key
- Tavily API key
- Gmail account with 2-Step Verification and an App Password for OTP email delivery

## Clone Repository

    git clone https://github.com/shayan-rehmani/Job-Hunter-AI.git
    cd Job-Hunter-AI

## Backend Environment

    python -m venv .venv
    .venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt

The tracked requirements.txt includes the Tavily dependency.

## Configure Root Environment

Copy the example file:

    copy .env.example .env

Set the following values in the root .env file:

    JWT_SECRET_KEY=your_long_random_jwt_secret
    OTP_PEPPER=your_separate_random_otp_secret
    DATABASE_URL=sqlite:///./job_hunter.db

    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=your_support_email@gmail.com
    SMTP_PASSWORD=your_gmail_app_password
    SMTP_FROM_EMAIL=your_support_email@gmail.com

    OTP_EXPIRE_MINUTES=5
    OTP_RESEND_SECONDS=60
    OTP_MAX_ATTEMPTS=5

Use separate, randomly generated secrets for JWT_SECRET_KEY and OTP_PEPPER. Do not use the example placeholders as real values.

### Gmail App Password Setup

1. Enable 2-Step Verification on the Gmail account used to send application emails.
2. Generate an App Password in Google Account settings.
3. Put the generated App Password in SMTP_PASSWORD.
4. Use the same Gmail address for SMTP_USERNAME and SMTP_FROM_EMAIL, unless your SMTP configuration supports a different sender.
5. Never commit the real .env file or share the App Password.

## Configure AI Services

Create agent_app/.env from agent_app/.env.example and configure:

- GOOGLE_API_KEY
- TAVILY_API_KEY

Keep both real environment files out of Git.

## Start Backend

From the repository root:

    python -m uvicorn api.main:app --reload

Open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/docs

## Start Frontend

Open a second CMD window:

    cd /d path\to\Job-Hunter-AI\frontend
    npm install
    npm run dev

Open the Vite URL printed in the terminal (normally http://localhost:5173).

The current frontend Axios client uses http://127.0.0.1:8000 as its base URL. When deploying, change this to the hosted API URL and make it configurable through a Vite environment variable (for example, VITE_API_BASE_URL).

## Production Build

    cd frontend
    npm run build

Vite writes the production bundle to frontend/dist/.

## Troubleshooting

- **Missing JWT_SECRET_KEY:** Check the root .env; the authentication security module requires this variable.
- **Missing OTP_PEPPER:** Set a separate random secret in the root .env; OTP hashing requires it.
- **OTP email not received:** Verify Gmail 2-Step Verification, App Password, SMTP host/port, sender address, and backend logs. Do not use your normal Gmail account password.
- **SMTP authentication error:** Generate a new Google App Password and update SMTP_PASSWORD.
- **Tavily authentication error:** Check TAVILY_API_KEY in agent_app/.env.
- **Gemini authentication error:** Check GOOGLE_API_KEY in agent_app/.env.
- **CORS error in browser:** Local CORS currently allows localhost and 127.0.0.1 on port 5173. Configure the exact frontend origin for hosted deployment.
- **Resume upload failure:** Check file type, 10 MB limit, write permissions for storage/resumes, and backend logs.
