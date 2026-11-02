# API reference

The FastAPI interactive schema is available at `/docs` when the backend is running. All routes below are relative to the API base URL (locally `http://127.0.0.1:8000`).

Protected routes require:

```http
Authorization: Bearer <access_token>
```

## Authentication

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Create an account | No |
| POST | `/auth/login` | Verify email/password and issue JWT | No |
| GET | `/auth/me` | Return current user | Yes |

Registration currently requires a password of at least 12 characters. Email OTP verification and password-reset endpoints are not implemented.

## Profile

The profile router is mounted by `api.main` with the prefix `/profile`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/profile/me` | Get candidate profile |
| GET | `/profile/me/completion` | Get profile completion |
| POST/PUT/DELETE | `/profile/me/...` | Manage profile sections |

Profile section routes include skills, education, experience, projects, certifications and languages. Refer to `/docs` for exact request schemas and path parameters.

## Resume

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/resume/upload` | Upload and analyze PDF/DOCX resume |
| GET | `/resume/me` | Retrieve saved resume analysis |

Upload uses multipart form data with the field name `file`. Maximum file size is 10 MB.

## Job discovery and preferences

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/jobs/search` | Manually discover jobs and save results |
| POST | `/jobs/matches` | Legacy AI-match discovery endpoint |
| GET | `/jobs/preferences` | Get saved job preferences |
| PUT | `/jobs/preferences` | Create/update job preferences |
| DELETE | `/jobs/preferences` | Delete job preferences |
| GET | `/jobs/saved` | List saved jobs |
| PATCH | `/jobs/saved/{job_id}/status` | Update saved-job status |
| DELETE | `/jobs/saved/{job_id}` | Remove saved job |
| GET | `/jobs/matches/saved` | Legacy saved-job matching endpoint |

### Job search query parameter

`POST /jobs/search` accepts the optional query parameter `posting_date_range`:

- `24h` — past 24 hours (default)
- `7d` — past 7 days
- `30d` — past 30 days
- `90d` — past 90 days
- `any` — no posting-date cutoff

The request can include selected sources. Check the live OpenAPI schema at `/docs` for the exact request representation.

### Update application status

Example:

```http
PATCH /jobs/saved/123/status
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "application_status": "Applied"
}
```

Allowed values: `Discovered`, `Saved`, `Interested`, `Applied`, `Interview`, `Rejected`, `Offer`.

## Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic API health response |

The live Swagger/OpenAPI page is the source of truth for current schemas and validation details.
