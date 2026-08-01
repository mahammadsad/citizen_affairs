# Troubleshooting

## Staff page says setup required

Add only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the site build environment, then rebuild.

## A staff member sees no articles

Confirm the account is active, has a role, and is assigned to the article or holds an appropriate broad permission. RLS intentionally hides unrelated drafts.

## Approval or publication is rejected

Read the database error. Common causes are self-approval, missing current-version approvals, missing primary source, incomplete Job/Scheme details, missing staff attribution, a stale article version or an expired deadline still marked open.

## Publication auto-merge fails

Read the sanitized failure in the `Export approved editorial content` run. Confirm repository auto-merge is enabled only with an up-to-date required `build` check, force pushes and deletion disabled, and the editorial token has Contents/Pull Requests write plus Administration read access. The workflow closes an unmerged PR and marks the event Failed; repair the named cause and request publication again.

## Publication stays Building

Open the publication run and PR in `mahammadsad/citizen_affairs`. A correctly repaired workflow does not ignore merge failures: it waits for required checks and the protected merge, then fails explicitly if either does not complete. Confirm the Supabase callback secrets are configured because a workflow without callback credentials cannot finalize the database event.

## Build fails

Run `npm ci` and `npm run validate` locally. Content validator errors are deliberate safety gates; correct the underlying record rather than weakening the rule.

## Local Supabase will not start

Confirm Docker is running, then use `npx supabase --help` and `npx supabase status`. Do not apply untested SQL directly to production as a workaround.
