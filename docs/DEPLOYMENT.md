# Deployment

## Public site

GitHub Actions validates pull requests and deploys `main` to GitHub Pages. The production origin is `https://citizenaffairs.in`, `public/CNAME` contains `citizenaffairs.in`, and the repository fallback is `https://mahammadsad.github.io/citizen_affairs/`. Keep the Pages source on **GitHub Actions**. The site reads its canonical origin from `brand.config.json`, so production uses `/` while a build without the custom domain uses `/citizen_affairs/`.

## Current editorial production target

The dedicated project reference is `tbymfgorepzzewagivit`. The recorded production release includes all seven migration files currently under `supabase/migrations/` and the `publish-content` and `deployment-callback` Edge Functions. Before changing production, compare the live migration list and deployed function versions with this repository. Do not reapply an existing migration.

For a function-only release, deploy only the changed function, preserve its authentication mode and then verify an unauthenticated request fails closed. Set the non-secret GitHub values to `mahammadsad` and `citizen_affairs`; do not rotate or print the dispatch token during a repository-name repair.

## Protected GitHub publication

1. Limit `EDITORIAL_GITHUB_TOKEN` to `mahammadsad/citizen_affairs` with Contents and Pull Requests write plus Administration read access.
2. Protect `main`: require pull requests and an up-to-date `build` check; disable force pushes and deletion. Do not grant the publication token a bypass.
3. Auto-merge is optional. It was disabled when operations were inspected on 1 August 2026. While disabled, automated publication fails explicitly, closes its unmerged PR and marks the publication event failed instead of pretending to succeed.
4. If auto-merge is later enabled, keep the required checks enforced. The workflow verifies repository and branch settings, requests squash auto-merge, waits for required checks and confirms the PR actually merged.
5. GitHub Pages must remain configured to deploy through GitHub Actions with the custom domain intact.

The callback sets an article to Published only after the PR merge triggers a successful build, GitHub Pages deployment and production smoke test. Failed exports, rejected auto-merge, failed checks, unmerged PRs, deployments or smoke tests set the publication event to Failed. Duplicate requests for the same active article version remain idempotent.
