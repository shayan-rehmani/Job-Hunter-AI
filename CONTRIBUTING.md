# Contributing

Thanks for your interest in Job Hunter AI.

## Development setup

Follow [Installation](docs/INSTALLATION.md) to prepare Python and frontend dependencies.

## Workflow

1. Create a focused branch for your change.
2. Keep changes scoped to one feature or fix.
3. Do not commit `.env`, API keys, local database files, resumes, or personal data.
4. Add or update documentation when changing API behavior or user workflows.
5. Run backend syntax checks and the frontend production build before opening a pull request.

## Suggested checks

Backend syntax check (from repository root):

```cmd
python -m compileall api auth database services
```

Frontend build:

```cmd
cd frontend
npm run build
```

## Pull requests

Include:

- What changed and why
- Relevant screenshots for UI changes
- API or database changes
- Tests/checks run
- Any migration or environment-variable requirements

## Project principles

- Keep users in control of job applications.
- Do not bypass CAPTCHA, access controls, login protections, or website terms.
- Do not fabricate job listings, company details, dates, or vacancy status.
- Protect candidate profiles, resumes, credentials, and tokens.
