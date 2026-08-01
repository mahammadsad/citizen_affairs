# Owner operations

This is the shortest safe operating guide.

## Current availability

The public website is live, but there is no production Supabase project. Staff sign-in, database drafts, topic discovery and automated publication are intentionally unavailable. Continue using Pages CMS only for temporary repository drafts; every new CMS article remains `draft: true` and cannot bypass review.

## Publish an article

The steps below apply only after a replacement Supabase project has passed the deployment and security checklist and `SUPABASE_INTEGRATION_ENABLED` has been deliberately enabled.

1. Sign in at `/staff/` with an active Supabase staff account.
2. Create a draft. Complete its Job or Scheme details, official sources and staff assignments in Supabase Studio until the fuller form UI is connected.
3. A different editor, fact-checker and final reviewer record approvals for the current article version.
4. Move the item to **Approved** with a written reason.
5. A Publisher selects **Request publication**, enters a reason, and starts the protected build.
6. GitHub opens a content pull request in `mahammadsad/citizen_affairs`, reports its number and URL, verifies branch protection and requests squash auto-merge only when it is safe.
7. GitHub Pages deploys the merge. Only then does the callback set the database record to **Published**.

If auto-merge is disabled, a required check fails or the PR does not merge, the workflow closes the unmerged publication PR and records a sanitized failure. Retry only after correcting the named configuration or validation error.

If any factual field, source, deadline, Job detail or Scheme detail changes, the database increments the article version and invalidates old approvals. Review the new version again.

## Everyday checks

- Review overdue `next_review_date` items.
- Close expired job applications instead of silently deleting them.
- Check official-source links and changed PDFs.
- Review correction reports; publish material corrections in the public log.
- Keep Owner accounts for emergencies. Use a normal editorial role for daily work.

## Never do these

- Never send a Supabase secret key, service-role key, GitHub token or password in chat, email, Markdown or browser code.
- Never mark an article Officially Confirmed without a primary official source and independent fact-check approval.
- Never change an approved fact directly to avoid re-review.
- Never claim a deployment succeeded until GitHub Pages and the publication event both say it succeeded.
- Never merge or reopen an automatically closed publication PR whose database event is already Failed; fix the cause and request publication again.

See [Troubleshooting](TROUBLESHOOTING.md) when a step fails.
