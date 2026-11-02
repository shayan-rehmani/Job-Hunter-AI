# Features and User Workflows

## Authentication

Job Hunter AI supports email-verified registration, password login, and OTP-based password recovery.

### Registration

1. Enter an email address.
2. Request a six-digit registration OTP.
3. Enter the received OTP.
4. Set and confirm a password.
5. The backend verifies the OTP and creates the account and candidate profile.

### Login

- Log in using email and password.
- Passwords are hashed with Argon2.
- Successful login returns a signed JWT access token.
- Protected API requests include the token as a Bearer token.
- Current access-token lifetime: 30 minutes.

### Forgot Password

1. Enter the account email address.
2. Request a password-reset OTP.
3. Enter the received OTP.
4. Set and confirm a new password.
5. The backend verifies the OTP and updates the password hash.

### OTP Controls

- Six-digit OTPs.
- Five-minute default expiry.
- Sixty-second default resend cooldown.
- Maximum of five verification attempts.
- HMAC-SHA256 hash storage using a separate environment secret.
- Successful verification consumes the OTP.
- Registration and password reset have separate OTP purposes.
- Email delivery uses Gmail SMTP.

## Candidate Profile

The profile workspace supports personal information and structured career information, including:

- Skills
- Education
- Work experience
- Projects
- Certifications
- Languages
- Profile completion information

The profile completion endpoint reports a percentage and missing required fields.

## Resume Manager

- Accepts PDF and DOCX files.
- Maximum upload size is 10 MB.
- Extracts text and links from the resume.
- Uses Gemini to analyze resume information.
- Synchronizes parsed fields into the candidate profile.
- Stores the uploaded file under storage/resumes/<user_id>/.

Resume content is sensitive personal information. Do not commit uploaded files to source control.

## Job Preferences

Users can configure:

- Preferred job titles
- Preferred locations
- Experience level
- Job types
- Job sources
- Minimum and maximum salary
- Currency
- Willingness to relocate
- Availability

The API validates that the minimum salary does not exceed the maximum salary.

## Find Jobs

- Search is manual; opening the page does not automatically start a new search.
- Search uses the user's resume analysis, location and saved preferences.
- Source filters include company career pages and supported public job platforms.
- Posting-date options: 24 hours (default), 7 days, 30 days, 90 days, and any time.
- Results are persisted so they remain available after refreshing the page.
- Finite date ranges exclude results without a parseable posting date.

Search coverage is limited by public search indexing and source accessibility. A result is not a guarantee that the vacancy is still open.

## Applications

The Applications page loads saved jobs and supports:

- Search by job title or company
- Filter by application status
- Update status and persist the change
- Open the job listing
- Remove a saved job

Supported status values are: Discovered, Saved, Interested, Applied, Interview, Rejected, and Offer.

The current data model tracks discovery and update timestamps. It does not have a dedicated application-submission date field.

## Dashboard

The dashboard loads saved-job counts and profile completion from the backend. It displays discovered jobs, application-stage counts, profile strength, recent jobs, and saved career preferences.

## AI and Automation Boundaries

Gemini is used for resume analysis and structuring/filtering discovered job results. Tavily is used to find public indexed pages. The app does not currently automate third-party account creation, bypass OTP or CAPTCHA protections, or submit final job applications. Users remain responsible for reviewing listings and submitting applications.
