# Citizen Affairs

Citizen Affairs is a fast, static, multilingual and independent public-information site focused initially on verified **Government Jobs** and **Welfare Schemes**. It is not a government department, an official government website or affiliated with a political party.

The public site uses Astro, TypeScript and portable Markdown snapshots. Private drafts, staff roles, approvals, sources and audit records are designed for Supabase. Publishing exports only an approved version into a protected GitHub pull request; a successful GitHub Pages deployment then confirms publication back to Supabase.

## Owner quick start

1. Read [Owner operations](docs/OWNER-OPERATIONS.md).
2. For a local site preview, install Node.js 22, then run `npm ci` and `npm run dev`.
3. Before any pull request, run `npm run validate`.
4. Do not put a secret key in a `PUBLIC_` variable or any browser file.
5. Pages CMS is a temporary owner-only draft editor. It does not replace the approval system.

## Main commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Astro preview |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm run validate:content` | Editorial, source, image and date gates |
| `npm run build` | Generate the static site |
| `npm run validate:html` | Validate routes, headings, metadata, JSON-LD and links |
| `npm run validate` | Run the complete safe-publication check |

## Repository map

- `src/content/` — portable public article, author, category and correction records
- `src/pages/` and `src/components/` — multilingual public website and private staff workspace shell
- `scripts/` — content, HTML and approved-snapshot validation/export
- `supabase/migrations/` — additive database schema, workflow rules and RLS
- `supabase/functions/` — authenticated publication request and deployment callback
- `.github/workflows/` — PR validation, Pages deployment and protected content export
- `brand.config.json` — centralized brand, legacy vertical, domain and contact settings
- `docs/` — owner, editorial, security, deployment and recovery guides

## Languages and launch scope

English, Bengali and Hindi remain supported. Equivalent translations share one `translationKey`. Only the `jobs` and `projects` categories are active; future sections remain configured but hidden until they have an editorial owner and enough verified content.

## Important status

The active repository is `mahammadsad/citizen_affairs`. Production uses the custom domain `https://citizenaffairs.in`; the repository Pages fallback is `https://mahammadsad.github.io/citizen_affairs/`.

The deployed public build targets the dedicated Supabase project `tbymfgorepzzewagivit`. The production integration release records the seven versioned migrations in `supabase/migrations/` and both Edge Functions as deployed. Treat the live migration list, function versions and secret stores as external production state: compare them before a database or function release, never reapply completed migrations and never copy secret values into this repository.

Pages CMS remains a temporary, draft-only editor. Protected publication uses repository pull requests and records an article as published only after merge, Pages deployment and the production smoke test all succeed.

Start with [Architecture](docs/ARCHITECTURE.md), [Editorial workflow](docs/EDITORIAL-WORKFLOW.md), and the [Implementation report](docs/IMPLEMENTATION-REPORT.md).
