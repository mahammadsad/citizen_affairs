# Sarkari Tathya Kendra

Sarkari Tathya Kendra is an independent, multilingual public-information website. It explains government jobs, welfare schemes, education, examinations, notices, and public services in clear language while linking readers to the original official source.

The site is built with Astro 5, TypeScript, Markdown content collections, and Pages CMS. It is statically deployed to GitHub Pages and does not require a paid service or backend.

## Supported languages

- English at the site root
- Bengali under `/bn/`
- Hindi under `/hi/`

Translated versions of one topic share a `translationKey`, allowing the language switcher and alternate-language SEO metadata to connect equivalent pages.

## Local development

Requirements: a current Node.js LTS release and npm.

```bash
npm ci
npm run check
npm run type-check
npm run build
npm run dev
```

`npm run dev` starts the Astro development server. `npm run build` creates the static site in `dist/` using the configured GitHub Pages base path.

## Publishing content

Articles live in:

- `src/content/articles/en/`
- `src/content/articles/bn/`
- `src/content/articles/hi/`

Create content through Pages CMS or add a Markdown file with YAML frontmatter that satisfies `src/content/config.ts`.

For a translated topic:

1. Create one article in each required language folder.
2. Give every translation the same `translationKey`.
3. Use a lowercase English-letter `urlSlug` containing only letters, numbers, and hyphens.
4. Add at least one primary official source URL.
5. Set the correct language, author, category, publication date, last-verified date, and verification status.
6. Leave `deadline` empty unless an official current document explicitly provides one.
7. Keep `draft: true` until the article is complete and reviewed.

Pages CMS commits published edits to `main`; the GitHub Actions workflow validates and deploys the resulting static site.

## Article verification rules

- Begin with a primary source: an official government portal, notification, order, or document.
- Confirm changing facts such as dates, eligibility, fees, amounts, vacancies, application links, and status directly against that source.
- Do not treat social posts, search snippets, copied notices, or third-party summaries as final authority.
- Do not invent a deadline, vacancy count, benefit amount, announcement, or featured image.
- Explain information in original language; do not copy substantial wording from a source.
- Tell readers to review the original official document before applying, paying, uploading documents, or acting.
- Record material updates and confirmed corrections in `updateHistory`.
- Recheck every external link and update `lastVerified` during review.

Use `officially-confirmed` only when the article's claims are directly supported by the linked official government source.

## Publication and verification statuses

- `draft: true`: Work in progress. Draft articles are excluded from normal listings, search, homepage cards, RSS, and the sitemap.
- `officially-confirmed`: The material claims have been checked against a directly supporting official source.
- `under-verification`: The article is not yet fully confirmed against a sufficient primary source.
- `corrected`: A material factual error was fixed transparently. The change should be described in `updateHistory`.
- `withdrawn`: The central claim cannot be supported or the article cannot be made reliably accurate. Withdrawn articles are removed from public discovery surfaces.
- `closed`: A time-bound process is no longer open. Preserve the original official source and make the closed state clear.

## GitHub Pages deployment

The production site is configured for:

`https://mahammadsad.github.io/sarkari-tathya-kendra`

`.github/workflows/deploy.yml` installs dependencies, validates the project, builds the static output, and publishes it to GitHub Pages. `astro.config.mjs` and `src/utils/constants.ts` share the project base-path rules so internal links, canonical URLs, assets, RSS, and sitemap URLs work under `/sarkari-tathya-kendra/`.

When moving to a custom domain, set `domain` in `brand.config.json` to the full origin without a trailing slash. The base path will then switch to `/`.

## Branding configuration

All public brand names, localized taglines, the logo path, domain, and contact email are centralized in `brand.config.json`.

- `brandNameEn`, `brandNameBn`, and `brandNameHi` control localized full names.
- `brandShortName` controls the short manifest/schema name.
- `brandTaglineEn`, `brandTaglineBn`, and `brandTaglineHi` control localized taglines.
- `logo` points to a public asset relative to the configured base path.
- `contactEmail` is used by the footer and trust pages.

Shared layouts and components must use `getBrandName`, `getBrandTagline`, `BRAND`, or `SITE` from `src/utils/constants.ts`; do not hardcode a public brand name in shared UI.
