# Security and Privacy

This document describes the current implementation and important controls to complete before exposing the application publicly. It is not a security audit.

## Current Controls

- Passwords are hashed using Argon2 through pwdlib.
- JWT access tokens use HS256 and expire after 30 minutes.
- Protected API routes resolve the current user from the token.
- Job and profile routes scope records to the authenticated user's candidate profile.
- Resume uploads accept PDF and DOCX only and enforce a 10 MB size limit.
- Registration and password reset use six-digit email OTPs.
- OTPs are stored as HMAC-SHA256 hashes using a separately configured pepper.
- OTPs expire after five minutes by default, have a 60-second resend cooldown, and allow up to five verification attempts by default.
- Successful OTP verification consumes the code.
- Git ignore rules exclude environment files, local databases, and private upload directories.

## Current Limitations

- The frontend currently stores JWTs in browser local storage.
- The current CORS allowlist is for local development only.
- Resume files are stored on the application filesystem.
- OTP resend cooldown is enforced per email and verification attempts are limited per OTP; broader IP-based and abuse-prevention rate limiting is not configured.
- OTP records need a retention and cleanup process.
- No production audit logging or security monitoring has been configured in this repository.
- Production hosting and production email delivery infrastructure have not been configured.
- The current API does not provide a documented self-service account-deletion workflow.

## Before Public Deployment

1. Use HTTPS for frontend and backend.
2. Generate strong, unique values for JWT_SECRET_KEY and OTP_PEPPER; never reuse development secrets.
3. Keep Gemini, Tavily, SMTP and database credentials in the hosting provider's secret manager.
4. Configure CORS to allow only the production frontend origin.
5. Add IP-based and endpoint-level rate limits to registration, login, OTP send/verify, resume upload and job search. Per-email OTP cooldowns alone are not sufficient.
6. Add monitoring and alerting for unusual OTP requests, login failures, SMTP errors and API abuse.
7. Establish a retention and cleanup policy for expired and consumed OTP records.
8. Use durable private object storage for resumes; do not serve private resume files publicly.
9. Use PostgreSQL backups and a tested restore procedure for production data.
10. Add a documented account-deletion workflow that removes database records and associated stored files, with clear confirmation.
11. Review token storage and session revocation strategy before production.
12. Keep .env, .env.* (except examples), database files, uploaded resumes and logs out of Git.
13. Review third-party provider terms and privacy policies before sending user data to search or AI services.

## Handling User Data

Resumes and profile details can contain personal information. Send only the minimum data required to external AI services, explain that processing to users, and provide an appropriate retention/deletion policy before accepting real users.

Never paste API keys, passwords, access tokens, private resumes, or production database credentials into issues or public commits.
