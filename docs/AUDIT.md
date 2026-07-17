# Repository and production audit

Audit date: 17 July 2026.

## Retained

- Astro 5 static generation, TypeScript, multilingual English/Bengali/Hindi routes and localized dates.
- Existing design tokens, responsive layout, dark mode, keyboard skip link, RSS, sitemap, saved articles, deadlines and static search index.
- GitHub Pages deployment and portable Markdown content.
- Pages CMS as an owner-only transitional draft tool.

## Problems found

- The visible Sarkari Tathya Kendra identity did not explain the Citizen Affairs India domain.
- Six categories were shown equally even though the public crawl had no content in most categories.
- Articles were generic records with simple source URLs and no enforced editorial roles.
- `draft` defaulted to false in Pages CMS and `admin` was assumed as hidden authorship.
- Search overlay queries were not shareable and the `SearchAction` target did not implement searching.
- Every factual article could be treated like news; image MIME metadata and large image handling needed improvement.
- GitHub Actions built the site but did not run editorial, route, HTML, image or JSON-LD gates.
- There was no private draft database, approval ledger, RLS permission model or deployment feedback loop.

## Accessibility and SEO observations

The site already had semantic landmarks, a single main heading on standard pages, keyboard navigation, focus management and responsive layouts. The implementation preserves those and adds generated-HTML validation. Remaining production QA is listed in [Implementation report](IMPLEMENTATION-REPORT.md).

## Asset audit

The published article image was converted to compact WebP and AVIF variants. Four large unused PNG uploads were retained because they may be user assets and deletion was not necessary for the launch foundation.

## Rollback

All work is additive or configuration-driven. Revert the pull request to restore the previous site. The Supabase migration is not applied automatically; if applied to a new empty project, the safest rollback is to discard that project. For a used project, restore from backup rather than manually dropping interdependent tables.
