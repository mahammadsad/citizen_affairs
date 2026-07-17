# Environment variables

| Location | Variable | Secret? | Purpose |
|---|---|---:|---|
| Astro build | `PUBLIC_SUPABASE_URL` | No | Citizen Affairs Supabase project URL |
| Astro build | `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | Browser-safe publishable key |
| Edge Function | `EDITORIAL_APP_ORIGIN` | No | Allowed staff dashboard origin |
| Edge Function | `GITHUB_OWNER` | No | Defaults to `mahammadsad` |
| Edge Function | `GITHUB_REPOSITORY` | No | Defaults to `sarkari-tathya-kendra` |
| Edge Function | `GITHUB_DISPATCH_TOKEN` | **Yes** | Fine-grained token allowed to dispatch this repository |
| GitHub Actions | `SUPABASE_URL` | No | Editorial project URL |
| GitHub Actions | `SUPABASE_SECRET_KEY` | **Yes** | Server-only export/callback key |
| GitHub Actions | `EDITORIAL_GITHUB_TOKEN` | **Yes** | Fine-grained token for publication branch and PR creation |

Use current publishable/secret keys. Rotate any secret immediately if it appears in output or source. Production secrets belong in Supabase and GitHub secret stores, never in the repository.
