# API Reference

Job Hunter AI provides a REST API built with FastAPI.

**Local API base URL:** http://127.0.0.1:8000

**Interactive documentation:** http://127.0.0.1:8000/docs

Protected endpoints require a JWT access token:

    Authorization: Bearer YOUR_ACCESS_TOKEN

## Authentication

All authentication endpoints are under /auth.

### Request Registration OTP

POST /auth/register/request-otp

Requests a six-digit registration OTP for the supplied email address.

Request body:

    {
      "email": "user@example.com"
    }

The endpoint uses a generic response to avoid revealing account-existence information.

### Complete Registration

POST /auth/register/complete

Verifies the registration OTP and creates the user account and candidate profile.

Request body:

    {
      "email": "user@example.com",
      "otp": "123456",
      "password": "your-secure-password"
    }

Password length must be between 12 and 128 characters.

### Login

POST /auth/login

Authenticates an existing user and returns a JWT access token.

Request body:

    {
      "email": "user@example.com",
      "password": "your-secure-password"
    }

The access token currently expires after 30 minutes.

### Request Password-Reset OTP

POST /auth/forgot-password/request-otp

Requests a password-reset OTP for the supplied email address. The response is designed not to disclose whether an account exists.

Request body:

    {
      "email": "user@example.com"
    }

### Reset Password

POST /auth/forgot-password/reset

Verifies the password-reset OTP and updates the user's password.

Request body:

    {
      "email": "user@example.com",
      "otp": "123456",
      "new_password": "your-new-secure-password"
    }

### Get Current User

GET /auth/me

Returns the currently authenticated user.

**Authentication:** Required.

## OTP Configuration

| Environment variable | Default | Purpose |
|---|---:|---|
| OTP_EXPIRE_MINUTES | 5 | OTP validity period |
| OTP_RESEND_SECONDS | 60 | Minimum resend interval |
| OTP_MAX_ATTEMPTS | 5 | Maximum verification attempts |
| OTP_PEPPER | Required secret | HMAC key used for OTP hashing |

OTP codes are six digits, stored as HMAC-SHA256 hashes, and consumed after successful verification. Email delivery uses Gmail SMTP settings from the root .env file.

## Profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /profile/me | Retrieve candidate profile |
| GET | /profile/me/completion | Retrieve profile completion information |

Profile section routes support management of skills, education, experience, projects, certifications, and languages. Refer to the live OpenAPI schema at /docs for exact paths and request schemas.

## Resume

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /resume/upload | Upload and analyze a PDF or DOCX resume |
| GET | /resume/me | Retrieve the current user's resume information |

Uploads use multipart form data with the field name file. Maximum file size is 10 MB.

## Job Preferences

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /jobs/preferences | Retrieve job-search preferences |
| PUT | /jobs/preferences | Create or update job-search preferences |
| DELETE | /jobs/preferences | Delete job-search preferences |

## Job Discovery and Tracking

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /jobs/search | Manually discover jobs |
| POST | /jobs/matches | Legacy AI-match discovery endpoint |
| GET | /jobs/saved | Retrieve saved and discovered jobs |
| GET | /jobs/matches/saved | Legacy saved-match endpoint |
| PATCH | /jobs/saved/{job_id}/status | Update a job's application status |
| DELETE | /jobs/saved/{job_id} | Delete a saved job |

### Job Posting-Date Filter

The job discovery endpoints support posting_date_range:

| Value | Meaning |
|---|---|
| 24h | Past 24 hours (default) |
| 7d | Past 7 days |
| 30d | Past 30 days |
| 90d | Past 90 days |
| any | Any available posting date |

Finite date ranges exclude listings whose posting dates cannot be parsed.

### Update Application Status

Example:

    PATCH /jobs/saved/123/status
    Content-Type: application/json
    Authorization: Bearer YOUR_ACCESS_TOKEN

    {
      "application_status": "Applied"
    }

Supported values: Discovered, Saved, Interested, Applied, Interview, Rejected, and Offer.

## Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | Basic API health response |

The live Swagger/OpenAPI page is the source of truth for exact request schemas, response models, validation rules, and any route changes.
