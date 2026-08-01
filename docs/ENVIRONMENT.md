# Environment variables

| Location | Variable | Secret? | Purpose |
|---|---|---:|---|
| GitHub Actions variable | `SUPABASE_INTEGRATION_ENABLED` | No | Explicit master switch; absent/false while no backend exists |
| GitHub Actions variable | `PUBLIC_SUPABASE_URL` | No | Replacement project URL compiled into the staff client only when enabled |
| GitHub Actions variable | `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | Browser-safe replacement-project key compiled only when enabled |
| Edge Function | `EDITORIAL_APP_ORIGIN` | No | Allowed staff dashboard origin |
| Edge Function | `GITHUB_OWNER` | No | Defaults to `mahammadsad` |
| Edge Function | `GITHUB_REPOSITORY` | No | Defaults to `citizen_affairs` |
| Edge Function | `GITHUB_DISPATCH_TOKEN` | **Yes** | Fine-grained token allowed to dispatch this repository |
| GitHub Actions | `SUPABASE_URL` | No | Editorial project URL |
| GitHub Actions | `SUPABASE_SECRET_KEY` | **Yes** | Server-only export/callback key |
| GitHub Actions | `EDITORIAL_GITHUB_TOKEN` | **Yes** | Fine-grained token for publication branches, pull requests and read-only branch-protection verification |

No production Supabase project is currently configured. Keep `SUPABASE_INTEGRATION_ENABLED` absent or false, and do not populate browser variables from the deleted project. The deploy workflow compiles empty values while the switch is off, publication jobs skip, and scheduled topic discovery is disabled.

For a verified replacement, use `GITHUB_OWNER=mahammadsad` and `GITHUB_REPOSITORY=citizen_affairs` explicitly even though the source defaults are safe. The editorial GitHub token needs Contents and Pull Requests write access plus Administration read access for `mahammadsad/citizen_affairs`; it does not need permission to bypass branch protection.

Use current publishable/secret keys. Rotate any secret immediately if it appears in output or source. Production secrets belong in Supabase and GitHub secret stores, never in the repository. Variable names may be documented; values must not be.
