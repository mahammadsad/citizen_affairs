# Troubleshooting

## Staff workspace says temporarily unavailable

This is the expected safe state while no production Supabase project exists. Do not restore values from the deleted project. A replacement must complete the database, RLS, role, Edge Function and unauthenticated-request checks before the integration switch is enabled.

## A staff member sees no articles

Confirm the account is active, has a role, and is assigned to the article or holds an appropriate broad permission. RLS intentionally hides unrelated drafts.

## Approval or publication is rejected

Read the database error. Common causes are self-approval, missing current-version approvals, missing primary source, incomplete Job/Scheme details, missing staff attribution, a stale article version or an expired deadline still marked open.

## Publication auto-merge fails

Read the sanitized failure in the `Export approved editorial content` run. Confirm repository auto-merge is enabled only with an up-to-date required `build` check, force pushes and deletion disabled, and the editorial token has Contents/Pull Requests write plus Administration read access. The workflow closes an unmerged PR and marks the event Failed; repair the named cause and request publication again.

## Publication stays Building

Open the publication run and PR in `mahammadsad/citizen_affairs`. A correctly repaired workflow does not ignore merge failures: it waits for required checks and the protected merge, then fails explicitly if either does not complete. Confirm the Supabase callback secrets are configured because a workflow without callback credentials cannot finalize the database event.

If no replacement Supabase project has been enabled, no new publication event should exist and the publication workflow remains skipped by design.

## Pull-request validation fails

Do not merge the pull request. Open the failed step in **Deploy to GitHub Pages** and fix the named cause. The generated reports retained by the run cover editorial freshness, workflow maintenance, performance, internal links and browser evidence.

Do not remove or weaken a gate because a dependency or content change fails it. A failed validation means the proposed change has not yet proved it is safe to publish.

## Dependency Review fails

Open the **Dependency Review** job and identify the newly introduced package and advisory. Prefer a patched version or remove the dependency. Do not suppress a high or critical finding merely to merge an automated update.

Dependabot pull requests are suggestions, not approvals. Major updates require their release notes to be read and should be merged separately from unrelated changes.

## GitHub Pages deployment fails

The previously deployed Pages version normally remains served. Correct the workflow or build problem through another commit or pull request. Do not manually upload the `dist` directory, edit the Pages artifact or force-push `main`.

## Production smoke fails after deployment

The new build may be deployed, but it is not **verified live**. Open the `production-smoke` job and its retained report. Check:

- the commit in `/health.json` and `/deployment.json`;
- the custom-domain response;
- all sitemap URLs;
- the service-worker registration;
- the English, Bengali and Hindi offline fallbacks.

Fix the failed check through the normal pull-request process. Do not report the release as verified until the production smoke job succeeds.

## Daily Production Health fails

Run the workflow once manually to rule out a transient network problem. If it fails again, inspect GitHub Pages status, the custom-domain configuration and DNS before changing application code. The workflow is read-only and does not deploy anything.

## Roll back a bad release

Create a new pull request that reverts the problematic merge commit. Require all normal checks and allow GitHub Pages to deploy the revert. Never rewrite or force-push `main`, and never copy an older build directly into Pages.

## Build fails locally

Use Node.js 22, then run `npm ci` and `npm run validate`. Content, workflow, link, SEO and security validator errors are deliberate safety gates; correct the underlying problem instead of weakening the rule.

## Local Supabase will not start

Confirm Docker is running, then use `npx supabase --help` and `npx supabase status`. Do not apply untested SQL directly to production as a workaround.
