# Citizen Affairs private automation

This service discovers useful official-source topics, captures the actual source material, prepares structured research and SEO context, writes an unpublished draft, runs an independent fact-check and saves Markdown only for human editorial review. It has no publication endpoint and cannot grant editorial approval.

## GitHub-only draft flow

The active draft path does **not** require Supabase. `python -m app.cli generate-drafts` performs this sequence:

1. Discover relevant topics from configured official RSS/Atom feeds or official listing pages.
2. Skip topics whose official source URL is already present in the article collection.
3. Fetch the official page and a small number of relevant official linked notices/PDFs.
4. Give the captured official evidence to the research model; PDFs are attached directly to Gemini.
5. Run SEO/search-intent analysis. Tavily, when configured, is used only for SERP context and never as factual evidence.
6. Write the article from the verified dossier only.
7. Run an independent fact-check against the same captured official evidence.
8. Save the result under `src/content/articles/<language>/` with `draft: true` and `verificationStatus: under-verification`.
9. If critical verification is unresolved, keep it private and set `workflowStatus: verification-failed`.

The scheduled GitHub workflow runs at 09:00 and 18:00 Asia/Kolkata when the repository variable `AUTOMATION_ENABLED=true`. Manual workflow runs are allowed even while that variable is disabled. Generated files are validated before they can be committed, and the workflow rejects any attempt to set a generated article to published, approved, scheduled or officially confirmed.

## Required GitHub configuration

Secrets:

- `GEMINI_API_KEY`
- Optional `TAVILY_API_KEY`
- Optional `EDITORIAL_GITHUB_TOKEN` when repository rules do not allow the workflow's normal `GITHUB_TOKEN` to write private drafts to `main`

Variables:

- `GEMINI_RESEARCH_MODEL`
- `GEMINI_WRITING_MODEL`
- `GEMINI_FACTCHECK_MODEL`
- `AUTOMATION_ENABLED=true` to enable scheduled runs
- Optional `OFFICIAL_FEED_URLS`
- Optional `AUTOMATION_DRAFT_LANGUAGES` (`en`, `bn`, `hi`, or a comma-separated combination)
- Optional `MAX_DRAFTS_PER_RUN` (defaults to `3`)

No UI, layout, component, Pages CMS field or public route is changed by this automation.

## Local setup

1. Create a Python 3.12 virtual environment.
2. Install `automation/requirements.txt`.
3. Copy `.env.example` to `.env` and supply server-only credentials.
4. Run `pytest -q` from this directory.
5. Run discovery with `python -m app.cli discover`.
6. Generate private drafts with `python -m app.cli generate-drafts`.
7. The optional API can be run with `uvicorn app.main:app --host 127.0.0.1 --port 8000` when `AUTOMATION_WEBHOOK_SECRET` is configured.

## Review boundary

Generated Markdown is structurally validated and active HTML is rejected. Automated generation always writes `draft: true`; it never writes `draft: false`, `workflowStatus: published`, `workflowStatus: approved`, `workflowStatus: scheduled`, or `verificationStatus: officially-confirmed`. Human review and the existing protected publication process remain separate and unchanged.
