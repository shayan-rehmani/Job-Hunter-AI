# Deployment guide

This guide is a deployment plan, not a claim that the current repository is production-ready.

## Suggested hosting layout

- **Frontend:** Vercel or another static hosting provider for the Vite build.
- **Backend:** Render or another Python hosting provider running FastAPI/Uvicorn.
- **Database:** Managed PostgreSQL for durable multi-user data.
- **Resume files:** Private object storage with access controls and backups.

Check provider pricing, free-tier limits, sleep behavior, persistent disk options, region availability and data-processing terms before choosing a plan.

## Required code/configuration work before deployment

1. Replace the hard-coded Axios base URL in `frontend/src/api/axios.js` with `import.meta.env.VITE_API_BASE_URL` and provide a safe local default.
2. Configure production CORS in `api/main.py` using an explicit environment variable for allowed frontend origins. Do not use wildcard origins with credentials.
3. Set `DATABASE_URL` to a managed PostgreSQL connection string. Confirm the SQLAlchemy driver is installed and database schema migrations are in place.
4. Add database migrations (for example, Alembic) before evolving production tables.
5. Move resume uploads from local `storage/resumes` to private durable object storage. The current filesystem path is not sufficient for ephemeral application instances.
6. Ensure `tavily-python` is pinned in `requirements.txt`; the current job-search service imports it but the tracked requirements file does not list it.
7. Configure secrets in the hosting dashboard, not in source code or committed files.
8. Add email OTP registration and password-reset flows before inviting public users, if those remain product requirements.
9. Add monitoring, rate limits, backups, and a tested account/data deletion process.

## Backend service

A typical ASGI start command is:

```bash
uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

Configure the provider's health-check path as `/`.

Expected environment variables:

- `JWT_SECRET_KEY` — strong random signing secret.
- `DATABASE_URL` — managed database connection string.
- `GOOGLE_API_KEY` — Gemini API key.
- `TAVILY_API_KEY` — Tavily API key.
- `GEMINI_PRIMARY_MODEL` — optional model override.
- `GEMINI_BACKUP_MODEL` — optional fallback model override.
- `CORS_ORIGINS` — to be implemented/configured in backend code before deployment.

Note: the current code loads AI/search keys from `agent_app/.env` and the JWT secret from the root `.env` during local development. Production deployment should standardize environment loading so provider-injected environment variables are used consistently.

## Frontend service

Build command:

```bash
npm install
npm run build
```

Output directory: `dist` (inside `frontend/`).

Set `VITE_API_BASE_URL` to the public backend URL after the Axios client is updated to read it. Vite environment variables are embedded in the client bundle; never put secrets in `VITE_*` variables.

For React Router history fallback, configure the static host to serve `index.html` for application routes.

## Go-live verification

- Register and log in with a test account.
- Verify protected routes reject missing/expired tokens.
- Upload and retrieve a test resume.
- Save and reload profile and preferences.
- Run a manual job search and verify results persist after refresh.
- Change an application status and verify persistence.
- Confirm user A cannot access user B's profile, resume or jobs.
- Verify resume objects are private and deletion works.
- Verify CORS, HTTPS, database backup and restore.
- Check logs for accidental secrets or personal data.

Do not advertise the service as production-ready until these checks pass.
