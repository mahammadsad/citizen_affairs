# Citizen Affairs private automation

This service discovers official-source topics, prepares structured research, SEO, draft, and independent fact-check outputs, and saves them for editorial review. It has no publication endpoint and cannot grant editorial approvals.

## Local setup

1. Create a Python 3.12 virtual environment.
2. Install automation/requirements.txt.
3. Copy .env.example to .env and supply server-only credentials.
4. Run pytest -q from this directory.
5. Run the API with uvicorn app.main:app --host 127.0.0.1 --port 8000.

Topic discovery can be run with python -m app.cli discover. Only configured official-domain feeds are accepted. The scheduled GitHub workflow remains inert until the AUTOMATION_ENABLED=true repository variable and required secrets are configured.

## Required secrets

- SUPABASE_URL
- SUPABASE_SECRET_KEY
- AUTOMATION_WEBHOOK_SECRET
- GEMINI_API_KEY
- Optional TAVILY_API_KEY

Model names and official feed URLs are configuration variables, not secrets. Search Console credentials should be added only when its connector is implemented. Never prefix a server credential with PUBLIC_.

## Review boundary

Generated Markdown is structurally validated and active HTML is rejected. A separate fact-check result must clear all critical blockers before a topic can reach needs_review. Moving a topic to approved requires an authenticated human with automation.review. Existing article approval and protected publication gates remain separate and unchanged.
