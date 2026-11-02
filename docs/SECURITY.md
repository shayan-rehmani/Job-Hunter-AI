# Security and privacy

This document describes the current implementation and important controls to complete before exposing the application publicly. It is not a security audit.

## Current controls

- Passwords are hashed using Argon2 through pwdlib.
- JWT access tokens use HS256 and expire after 30 minutes.
- Protected API routes resolve the current user from the token.
- Job and profile routes scope records to the authenticated user's candidate profile.
- Resume uploads accept PDF and DOCX only and enforce a 10 MB size limit.
- Git ignore rules exclude environment files, local databases, and private upload directories.

## Current limitations

- Email ownership is not verified. OTP registration is not implemented.
- Forgot-password OTP and account recovery are not implemented.
- JWTs are stored in browser local storage by the current frontend.
- The current CORS allowlist is for local development only.
- Resume files are stored on the application filesystem.
- There is no documented account-deletion workflow in the current API.
- No production rate-limiting, audit logging, or security monitoring has been configured in this repository.

## Before public deployment

1. Use HTTPS for frontend and backend.
2. Generate a strong, unique `JWT_SECRET_KEY`; never reuse a development secret.
3. Keep Gemini, Tavily, SMTP and database credentials in the hosting provider's secret manager.
4. Configure CORS to allow only the production frontend origin.
5. Add email verification and OTP-based password reset with short expiry, single-use codes, attempt limits, resend cooldowns, and hashed OTP storage.
6. Add rate limits to registration, login, OTP send/verify, resume upload and job search endpoints.
7. Use durable private object storage for resumes; do not serve private resume files publicly.
8. Use PostgreSQL backups and a tested restore procedure for production data.
9. Add account deletion that removes database records and associated stored files, with clear confirmation and audit-safe handling.
10. Review token storage and session revocation strategy before production.
11. Keep `.env`, `.env.*` (except examples), database files, uploaded resumes and logs out of Git.
12. Review third-party provider terms and privacy policies before using search or AI services with user data.

## Handling user data

Resumes and profile details can contain personal information. Send only the minimum data required to external AI services, explain that processing to users, and provide an appropriate retention/deletion policy before accepting real users.

Never paste API keys, passwords, access tokens, private resumes, or production database credentials into issues or public commits.
