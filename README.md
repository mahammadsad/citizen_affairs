# Citizen Affairs India

Citizen Affairs India is a fast, static, multilingual public-information site focused initially on verified **Government Jobs** and **Welfare Schemes**. Sarkari Tathya Kendra remains the recognizable government-information vertical during the brand transition.

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

The repository contains the complete migration and integration code, but it is intentionally **not applied to either existing connected Supabase project** because neither is identified as the Citizen Affairs editorial project. Follow [Deployment](docs/DEPLOYMENT.md) after creating or explicitly selecting the correct project.

Start with [Architecture](docs/ARCHITECTURE.md), [Editorial workflow](docs/EDITORIAL-WORKFLOW.md), and the [Implementation report](docs/IMPLEMENTATION-REPORT.md).
