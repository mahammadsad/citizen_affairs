# Demo Brand public-information website

A static, multilingual public-information website built with Astro, TypeScript, Markdown content collections and Pages CMS. It supports English, Bengali and Hindi and deploys free through GitHub Pages.

## Local development

```bash
npm ci
npm run check
npm run build
npm run dev
```

## Branding

All temporary public branding lives in `brand.config.json`:

```json
{
  "brandName": "Demo Brand",
  "brandShortName": "Demo",
  "brandTagline": "Verified updates, clearly explained",
  "domain": "",
  "contactEmail": "contact.mahammadsad@gmail.com"
}
```

Change those five values when the final name/domain is ready. Keep `domain` empty while using the GitHub Pages project URL. For a custom domain, use an origin without a trailing slash, such as `https://example.com`.

## Publishing articles with Pages CMS

Open Pages CMS, select the language collection and choose **New article**:

- English articles save to `src/content/articles/en/`
- বাংলা আর্টিকেল saves to `src/content/articles/bn/`
- हिन्दी लेख saves to `src/content/articles/hi/`

For translations, give all three versions the same `translationKey`. Each version can have its own English-letter URL slug. Select category and verification status from the dropdowns, add at least one official source, leave **Draft** off, and save. Pages CMS commits the Markdown file to `main`; GitHub Actions checks, builds and publishes the site automatically.

Only select `officially-confirmed` when a government notification or portal supports the claim. Draft and withdrawn articles do not appear in normal listings, search, homepage or ticker.

## Content model

Articles support publication/update/verification dates, deadline, government level, region, eligibility, quick summary, important dates, benefits/vacancies/amount, documents, update history, official links, FAQs, tags, featured image, featured state, SEO fields and rich Markdown content.

## Routes

- `/` and `/en/` — English
- `/bn/` — Bengali
- `/hi/` — Hindi
- `/{lang}/articles/` — updates and client-side filters
- `/{lang}/deadlines/` — deadline-sorted updates
- `/{lang}/saved/` — saved and recently viewed articles from localStorage

The configured GitHub Pages base path is automatically prefixed when no custom domain is set.
