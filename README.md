# সরকারি তথ্যকেন্দ্র · Sarkari Tathya Kendra

English-default, Bengali-enabled public-information website for verified government jobs, welfare schemes, education notices, examinations, results and citizen services.

Live target: `https://mahammadsad.github.io/sarkari-tathya-kendra/`

## What is included

- English and Bengali routes under `/en/` and `/bn/`
- Article language switch with linked translations
- Verification status, source links and last-verified dates
- Government jobs, welfare, exams, notices, public services and education categories
- GitHub-based content editing through Pages CMS
- Static search index for both languages
- RSS, sitemap, canonical URLs, `hreflang` and structured data
- Responsive layout, dark mode and local Bengali fonts
- Privacy, terms, disclaimer and editorial-policy pages
- Ad-ready layout with advertising disabled by default
- GitHub Actions deployment to GitHub Pages

No separate OAuth worker, database or permanent backend is required.

## Local development

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

## Publish an article without editing code

1. Open [Pages CMS](https://app.pagescms.org/).
2. Sign in with the GitHub account that can edit this repository.
3. Select `mahammadsad/sarkari-tathya-kendra`.
4. Open **English articles** or **বাংলা আর্টিকেল**.
5. Complete the form, add at least one official source, and save.
6. Set `draft: false` only after verification.

Pages CMS reads `.pages.yml`, writes the Markdown file to GitHub and triggers the normal GitHub Pages deployment.

### Translation rule

English and Bengali versions are separate files. Give both versions:

- the same `translationKey`;
- the appropriate `language` value; and
- their own `urlSlug`.

Example:

```text
src/content/articles/en/example-notice.md
src/content/articles/bn/example-notice.md
```

## Verification status

- `officially-confirmed`
- `under-verification`
- `corrected`
- `withdrawn`
- `closed`

Dates, vacancies, amounts, eligibility and application links must not be published as confirmed unless the original government source supports them.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` runs on every push to `main`.

In repository settings, select:

```text
Settings → Pages → Source → GitHub Actions
```

## Advertising

Advertising is disabled in `src/utils/constants.ts`:

```ts
export const ADS = {
  enabled: false,
  publisherId: '',
};
```

Before enabling ads, add the real publisher ID, publish the required privacy/consent disclosures and place the authorised seller line in `public/ads.txt`.

## Important disclaimer

সরকারি তথ্যকেন্দ্র কোনো সরকারি প্রতিষ্ঠান নয়। এটি একটি স্বাধীন তথ্য প্ল্যাটফর্ম। আবেদন, payment বা গুরুত্বপূর্ণ সিদ্ধান্তের আগে মূল সরকারি বিজ্ঞপ্তি ও অফিসিয়াল portal যাচাই করুন।
