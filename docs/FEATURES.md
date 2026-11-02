# Features and user workflows

## Authentication

- Register with an email address and password.
- Log in with email and password.
- Authenticated API calls use a Bearer JWT.
- Current access-token lifetime: 30 minutes.

Email verification by OTP and forgot-password OTP are planned improvements and are not part of the current implementation.

## Candidate profile

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
- Stores the uploaded file under `storage/resumes/<user_id>/`.

Resume content is sensitive personal information. Do not commit uploaded files to source control.

## Job preferences

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
- Supported source filters include Company Career Pages, LinkedIn, Naukri, Indeed, Foundit, Internshala and other job platforms.
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

Supported status values are: `Discovered`, `Saved`, `Interested`, `Applied`, `Interview`, `Rejected`, and `Offer`.

The current data model tracks discovery and update timestamps. It does not have a dedicated application-submission date field.

## Dashboard

The dashboard loads saved-job counts and profile completion from the backend. It displays discovered jobs, application-stage counts, profile strength, recent jobs, and saved career preferences.

## AI and automation boundaries

Gemini is used for resume analysis and structuring/filtering discovered job results. Tavily is used to find public indexed pages. The app does not currently automate account creation, OTP handling, CAPTCHA solving, or final job application submission. Users remain responsible for reviewing listings and submitting applications.
