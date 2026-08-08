# Citizen Affairs

Citizen Affairs is a fast, static, multilingual and independent public-information site built with Astro 7.1.6 and TypeScript. It covers official-source guides, opportunities, public benefits, deadlines and citizen services, with the verification status shown on each publication. It is not a government department, an official government website or affiliated with a political party.

The public site uses portable Markdown snapshots. Private drafts, staff roles, approvals, sources and audit records are designed for Supabase. When that optional editorial backend is enabled, publishing exports only an approved version into a protected GitHub pull request; a successful GitHub Pages deployment then confirms publication back to Supabase.

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
- `brand.config.json` — centralized brand, category, domain and contact settings
- `docs/` — owner, editorial, security, deployment and recovery guides

## Languages and category scope

English, Bengali and Hindi are supported. Equivalent translations share one `translationKey`.

The centralized brand configuration currently contains seven category IDs: `jobs`, `exams`, `materials`, `projects`, `affairs`, `notices` and `guides`. A configured category is not evidence that it has approved launch content. Jobs and Exams currently contain protected Bengali drafts and must remain unpublished until verification and editorial approval are complete.

## Release verification

Pull requests run type checks, formatting, unit tests, editorial validation, build validation, SEO checks, link checks, secret scanning, dependency auditing and responsive browser tests. A merged commit is not considered verified live until GitHub Pages deploys the same commit and the complete production smoke suite passes.

Production deployment runs are serialized. Pull-request runs may be cancelled when superseded, but an active production deployment is not cancelled. Because the GitHub Pages action limits a single attempt to ten minutes, the workflow makes one controlled second attempt after a queue timeout before declaring the deployment failed.

## Important status

The active repository is `mahammadsad/citizen_affairs`. Production uses the custom domain `https://citizenaffairs.in`; the repository Pages fallback is `https://mahammadsad.github.io/citizen_affairs/`.

No live Supabase project is currently configured. The previous project was deleted, so the deployed site does not receive Supabase browser variables, the staff workspace is unavailable, scheduled topic discovery is disabled and database-backed publication is fail-closed. The seven versioned migrations and both Edge Functions remain in the repository as a reviewed blueprint for a future replacement project; they are not evidence of a live deployment.

Pages CMS remains a temporary, draft-only editor for repository drafts. The protected database publication design remains in source, but it is inactive until a replacement Supabase project is explicitly provisioned and verified.

Start with [Architecture](docs/ARCHITECTURE.md), [Editorial workflow](docs/EDITORIAL-WORKFLOW.md), and the [Implementation report](docs/IMPLEMENTATION-REPORT.md).
