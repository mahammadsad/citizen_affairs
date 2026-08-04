# Owner operations

This is the shortest safe operating guide for Citizen Affairs.

## Current operating model

Citizen Affairs is a static GitHub Pages website. There is currently no production Supabase project, so staff sign-in, database drafts, topic discovery and database-backed publication are intentionally unavailable. Pages CMS may create temporary repository drafts, but every new CMS article remains `draft: true` and cannot bypass review.

Do not restore credentials or URLs from the deleted Supabase project. A replacement project must pass the database, RLS, role, Edge Function and unauthenticated-request checks before `SUPABASE_INTEGRATION_ENABLED` is deliberately enabled.

## Understand release status

These three states are different:

1. **Merged** — the change is present on the protected `main` branch.
2. **Deployed** — the GitHub Pages deployment job completed successfully.
3. **Verified live** — the post-deployment production browser job found the exact expected commit on `citizenaffairs.in` and passed the sitemap, important-route, service-worker and offline checks.

Never describe a release as live merely because its pull request merged. Open the **Deploy to GitHub Pages** workflow and confirm the `production-smoke` job succeeded.

The `/status/` page and `/health.json` show the build currently served by the website. They do not prove that the GitHub production test suite passed; the workflow result is the verification record.

## Routine checks

- The read-only **Production Health** workflow runs every day at 08:45 IST.
- Review a failed health run before publishing more changes.
- Review overdue `next_review_date` items and close expired opportunities instead of deleting them silently.
- Check official-source links and changed PDFs.
- Review correction reports and publish material corrections in the public log.
- Keep Owner accounts for emergencies; use normal editorial roles for routine work after a replacement backend is enabled.

## Dependency updates

Dependabot checks npm packages and GitHub Actions each Monday morning. It opens pull requests; it never merges them automatically.

For each dependency pull request:

1. Confirm the **Dependency Review** job has no high or critical vulnerability finding.
2. Require the complete **Deploy to GitHub Pages** pull-request workflow to pass.
3. Read major-version release notes before merging. Do not merge a major upgrade merely because the bot opened it.
4. Merge only one risky major upgrade at a time so a regression can be identified and reverted cleanly.

All external GitHub Actions must remain pinned to immutable 40-character commit SHAs. Do not replace a SHA with `@main`, `@master` or a floating `@v1` tag.

## When a release fails

### Pull-request validation fails

Do not merge. Open the failed step and correct the named problem. Never weaken a content, security, dependency, link, SEO or accessibility gate merely to make the check green.

### Deployment fails

The previously deployed Pages version normally remains available. Correct the failure in a new commit or pull request, then let the protected workflow deploy again. Do not force-push `main`.

### Deployment succeeds but production smoke fails

Treat the change as **deployed but not verified live**. Read the failed browser assertion and retained evidence. Check the exact served commit, custom domain, sitemap, service worker and offline fallback before making another release claim.

### The public website appears unavailable

Run **Production Health** manually from GitHub Actions. Check GitHub Pages status, the custom-domain configuration and DNS before changing application code. Avoid repeated blind redeployments because they can hide the original cause.

## Safe rollback

Rollback through a new pull request that reverts the problematic merge commit. Require the normal validation and production smoke checks. Never rewrite or force-push `main`, and never manually edit the deployed Pages artifact.

## Publishing after a replacement backend exists

The following applies only after a replacement Supabase project passes its deployment and security checklist:

1. A staff member creates or updates a draft and completes structured details and official sources.
2. Different assigned staff record editorial, fact-check and final-review approvals for the current version.
3. A Publisher requests publication with a written reason.
4. GitHub exports the approved snapshot into a protected content pull request.
5. GitHub Pages deploys the protected merge.
6. Only after successful production verification does the callback mark the database publication event as deployed.

Any factual, source, deadline or structured-detail change creates a new version and invalidates old approvals.

## Never do these

- Never send a Supabase secret key, service-role key, GitHub token, password or recovery code in chat, email, Markdown or browser code.
- Never put a secret in a `PUBLIC_` variable.
- Never claim Officially Confirmed status without a primary official source and independent fact-check approval.
- Never claim a release is verified live until the production smoke job succeeds.
- Never bypass a failed workflow by manually uploading files or weakening the failing rule.
- Never merge or reopen an automatically closed publication pull request whose database event is already Failed; correct the cause and request publication again.

See [Troubleshooting](TROUBLESHOOTING.md) for detailed failure guidance.
