# Installation and local development

These instructions target Windows CMD and the current repository layout.

## Prerequisites

- Python 3.12
- Node.js with npm
- Git
- Gemini API key
- Tavily API key

## Clone repository

```cmd
git clone https://github.com/shayan-rehmani/Job-Hunter-AI.git
cd Job-Hunter-AI
```

## Backend environment

```cmd
python -m venv .venv
.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install tavily-python
```

The current tracked requirements file does not include `tavily-python`, although `services/job_search.py` imports it. Install it explicitly as shown until the dependency is added to the pinned requirements.

Create the root `.env` using `.env.example`. Set a strong random JWT secret.

Create `agent_app/.env` using `agent_app/.env.example`. Set `GOOGLE_API_KEY` and `TAVILY_API_KEY`. Keep both real files out of Git.

## Start backend

From the repository root:

```cmd
uvicorn api.main:app --reload
```

Open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/docs

## Frontend environment

Open a second CMD:

```cmd
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173).

The current frontend Axios client uses `http://127.0.0.1:8000` as its base URL. When deploying, change this to the hosted API URL and make it configurable through a Vite environment variable (for example, `VITE_API_BASE_URL`).

## Production build

```cmd
cd frontend
npm run build
```

Vite writes the production bundle to `frontend/dist/`.

## Troubleshooting

- **Missing JWT_SECRET_KEY:** Check the root `.env`; the authentication security module requires this variable.
- **Tavily import error:** Install `tavily-python`; it is not currently in the tracked requirements file.
- **Gemini/Tavily authentication errors:** Check that the corresponding keys are set in `agent_app/.env`.
- **CORS error in browser:** Local CORS currently allows localhost and 127.0.0.1 on port 5173. Add the exact frontend origin when configuring a hosted deployment.
- **Resume upload failure:** Check file type, 10 MB limit, write permissions for `storage/resumes`, and backend logs.
