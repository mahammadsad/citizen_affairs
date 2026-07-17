# Troubleshooting

## Staff page says setup required

Add only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the site build environment, then rebuild.

## A staff member sees no articles

Confirm the account is active, has a role, and is assigned to the article or holds an appropriate broad permission. RLS intentionally hides unrelated drafts.

## Approval or publication is rejected

Read the database error. Common causes are self-approval, missing current-version approvals, missing primary source, incomplete Job/Scheme details, missing staff attribution, a stale article version or an expired deadline still marked open.

## Publication stays Building

Open the publication GitHub Actions run and PR. Confirm the three GitHub/Supabase secrets are configured, the fine-grained token can create PRs, branch protection checks ran, the PR merged and Pages deployed. A missing callback secret cannot finalize the event.

## Build fails

Run `npm ci` and `npm run validate` locally. Content validator errors are deliberate safety gates; correct the underlying record rather than weakening the rule.

## Local Supabase will not start

Confirm Docker is running, then use `npx supabase --help` and `npx supabase status`. Do not apply untested SQL directly to production as a workaround.
