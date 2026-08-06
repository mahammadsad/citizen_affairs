# Citizen Affairs

Citizen Affairs is a fast, static, multilingual and independent public-information site focused on verified opportunities, benefits, notices and practical citizen guidance. It is not a government department, an official government website or affiliated with a political party.

The public site uses Astro 7, TypeScript and portable Markdown snapshots. Private drafts, staff roles, approvals, sources and audit records are designed for Supabase. When that optional editorial backend is enabled, publishing exports only an approved version into a protected GitHub pull request; a successful GitHub Pages deployment then confirms publication back to Supabase.

`project-status.json` is the machine-readable source of truth for the current framework major version, production domain, active categories and editorial-backend state.

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
- `brand.config.json` — centralized brand, domain, contact and launch-category settings
- `project-status.json` — reviewed production status shared by documentation and tests
- `docs/` — owner, editorial, security, deployment and recovery guides

## Languages and launch scope

English, Bengali and Hindi are supported. Equivalent translations share one `translationKey`.

The currently promoted launch sections are:

- study materials and explainers (`materials`)
- welfare schemes and benefits (`projects`)
- current affairs (`affairs`)
- notices and alerts (`notices`)
- practical citizen guides (`guides`)

Government jobs and exams remain configured but are hidden from launch navigation until their draft guides complete source review and publication checks. The active and pending lists are recorded in `project-status.json`.

## Production and editorial status

The active repository is `mahammadsad/citizen_affairs`. Production uses the custom domain `https://citizenaffairs.in`; the repository Pages fallback is `https://mahammadsad.github.io/citizen_affairs/`.

No live Supabase project is currently configured. The previous project was deleted, so the deployed site does not receive Supabase browser variables, the staff workspace is unavailable, scheduled topic discovery is disabled and database-backed publication is fail-closed. The versioned migrations and Edge Functions remain in the repository as a reviewed blueprint for a future replacement project; they are not evidence of a live deployment.

Pages CMS remains a temporary, draft-only editor for repository drafts. The protected database publication design remains in source, but it is inactive until a replacement Supabase project is explicitly provisioned and verified.

Start with [Architecture](docs/ARCHITECTURE.md), [Editorial workflow](docs/EDITORIAL-WORKFLOW.md), [Deployment](docs/DEPLOYMENT.md) and the [Implementation report](docs/IMPLEMENTATION-REPORT.md).
