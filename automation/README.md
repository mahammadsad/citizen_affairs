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

`Generate review drafts` is the only workflow allowed to generate repository drafts automatically. It runs at 09:00, 15:00 and 21:00 Asia/Kolkata unless `AUTOMATION_ENABLED=false`, and it creates at most one topic per run. A manual run uses the same safety path.

When a new draft is produced, the workflow:

1. rejects every changed path outside the language article directories;
2. requires `draft: true` and a non-public workflow status;
3. rejects automatic `officially-confirmed` verification;
4. runs the automation tests plus Astro content, build and SEO validation;
5. opens an isolated **draft** pull request; and
6. leaves it open for an accountable human reviewer. The automation does not merge its own work.

Even after a human merges a generated draft, it is **not** published. Public content helpers require both `draft: false` and a public workflow status, so a generated draft remains absent from public article routes, listings and search until the separate human editorial/publication process changes its state.

The older `generate-drafts.yml` workflow is intentionally test-only. It must not contain a schedule, manual generation trigger, or direct push to `main`; this avoids duplicate generators and competing safety models.

## Required GitHub configuration

Secrets:

- `GEMINI_API_KEY`
- `EDITORIAL_GITHUB_TOKEN` — required by the canonical workflow so branch pushes, pull-request checks, merges and downstream deployment events are emitted normally
- Optional `TAVILY_API_KEY`

Variables:

- `GEMINI_RESEARCH_MODEL`
- `GEMINI_WRITING_MODEL`
- `GEMINI_FACTCHECK_MODEL`
- `AUTOMATION_ENABLED=false` to pause both scheduled and manual draft generation immediately; any other value leaves the canonical workflow enabled
- Optional `OFFICIAL_FEED_URLS`
- Optional `DRAFT_LANGUAGES` (`en`, `bn`, `hi`, or a comma-separated combination; defaults to `bn`)

Every run reports one or more machine-readable outcomes: `candidate_published_as_draft`, `no_eligible_candidate`, `source_unreachable`, `fact_check_failed`, or `workflow_failed`. “Published as draft” means written only to the private draft path; it never means public publication.

The canonical workflow deliberately fixes `MAX_DRAFTS_PER_RUN` to `1` so each scheduled run stays selective and reviewable.

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
