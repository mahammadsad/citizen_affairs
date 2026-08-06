# Repository and production audit

Audit reviewed: 6 August 2026.

## Current foundation

- Astro 7 static generation with TypeScript.
- Multilingual English, Bengali and Hindi routes with localized dates and metadata.
- GitHub Pages deployment on `https://citizenaffairs.in`.
- Portable Markdown content with source, verification, review-date and workflow metadata.
- Canonical URLs, hreflang, RSS, sitemap, structured data and social metadata.
- Dark mode, keyboard skip link, saved articles, deadlines and offline fallback.
- CI gates for types, formatting, content, freshness, editorial readiness, HTML, SEO, performance, links, secrets, dependencies, responsive screenshots and production smoke tests.

The reviewed operational state is stored in the repository root at `project-status.json` and validated during `npm test`.

## Issues corrected in the August 2026 audit

- Article source counts and source lists now share one normalized, deduplicated source collection.
- Legacy Sarkari Tathya Kendra editorial artwork is no longer served as current Citizen Affairs imagery.
- Empty jobs and exams sections are hidden from launch navigation while their articles remain drafts.
- Search result card cleanup and image placeholders are handled by one enhancement layer instead of two competing MutationObservers.
- Production browser checks remain serial and no-retry, with explicit action and navigation timeouts so any unresolved live failure remains visible.
- Bengali and Hindi article metadata and body typography have improved mobile sizing and line height.
- The static-site content security policy blocks script attributes, framing, external workers and unapproved media origins while retaining the inline allowances currently required by the Astro output.
- README, this audit and machine-readable status now describe Astro 7 and the actual launch scope.

## Deliberate current limitations

- The Supabase editorial backend is disabled. Migrations and Edge Functions are retained as a reviewed blueprint only.
- Pages CMS prepares drafts; it does not approve or publish content.
- Government jobs and exams remain pending until their draft guides complete review.
- GitHub Pages cannot set all desired response headers directly. The in-document CSP is therefore useful but not equivalent to an edge-delivered response header.
- Some historical binary uploads remain in Git history even when removed from the active tree.

## Editorial launch rule

A section should not be promoted in navigation merely because its route exists. It should have reviewed public content, an update owner and a repeatable source-check process. `brand.config.json` controls promoted categories, and `project-status.json` records both active and pending categories.

## Accessibility and SEO

The site uses semantic landmarks, visible focus treatment, a skip link, localized metadata, canonical URLs, hreflang, structured data and generated-output validation. Production QA should continue to test desktop, mobile, keyboard navigation, Indic-script readability and every sitemap URL after deployment.

## Rollback

Changes remain configuration-driven and reviewable in Git. Revert the relevant pull request to restore the previous static site. Supabase migrations are not applied automatically; if a replacement project is later provisioned, use verified backups rather than manually dropping interdependent tables.
