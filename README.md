

\# Job Hunter AI



An autonomous AI-powered job hunting assistant built with Google Agent Development Kit (ADK).



\## Features



\- Resume onboarding

\- Professional profile extraction

\- Missing information detection

\- Job preference collection

\- Job discovery and matching

\- Career application assistance

\- Application tracking



\## Technology Stack



\- Python 3.12

\- Google ADK 2.13.0

\- Gemini API



\## Setup



\### 1. Clone the repository



```bash

git clone YOUR\_REPOSITORY\_URL

cd Job-Hunter-AI

```



\### 2. Create virtual environment



```bash

python -m venv .venv

```



\### 3. Activate environment (Windows CMD)



```cmd

.venv\\Scripts\\activate.bat

```



\### 4. Install dependencies



```bash

pip install -r requirements.txt

```



\### 5. Configure API key



Create `agent\_app/.env`:



```env

GOOGLE\_API\_KEY=your\_api\_key

```



\### 6. Run the agent



```bash

adk run agent\_app

```



\## Project Status



Initial Google ADK agent successfully connected to Gemini.

Resume parsing is under development.



