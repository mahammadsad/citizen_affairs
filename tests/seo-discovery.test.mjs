import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');
const seo = await readFile('src/lib/seo.ts', 'utf8');
const sitemap = await readFile('src/pages/sitemap.xml.ts', 'utf8');
const feed = await readFile('src/lib/feed.ts', 'utf8');
const rootFeed = await readFile('src/pages/rss.xml.ts', 'utf8');
const localeFeed = await readFile('src/pages/[lang]/rss.xml.ts', 'utf8');
const articleRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const articleStructuredData = await readFile('src/components/ArticleStructuredData.astro', 'utf8');
const validator = await readFile('scripts/validate-seo.mjs', 'utf8');
const packageJson = await readFile('package.json', 'utf8');
const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');

test('base metadata provides canonical locale discovery and stable graph identities', () => {
  assert.match(baseLayout, /SCHEMA_IDS\.website/);
  assert.match(baseLayout, /SCHEMA_IDS\.organization/);
  assert.match(baseLayout, /\[locale\]: suppliedAlternateUrls\[locale\] \|\| resolvedCanonical/);
  assert.match(baseLayout, /hreflang="x-default"/);
  assert.match(baseLayout, /og:locale:alternate/);
  assert.match(baseLayout, /localizedFeedUrl\(locale\)/);
});

test('article schema has stable IDs and transparent publisher relationships', () => {
  assert.match(seo, /'@id': `\$\{canonical\}#article`/);
  assert.match(seo, /isAccessibleForFree: true/);
  assert.match(seo, /'@id': SCHEMA_IDS\.organization/);
  assert.match(seo, /'@id': `\$\{canonical\}#webpage`/);
});

test('sitemap emits reciprocal multilingual clusters and excludes expired discovery', () => {
  assert.match(sitemap, /xmlns:xhtml/);
  assert.match(sitemap, /isCurrentListingCandidate\(data\)/);
  assert.match(sitemap, /translationGroups/);
  assert.match(sitemap, /hreflang=\\"x-default\\"/);
  assert.match(sitemap, /alternates\.en \|\| alternates\.bn \|\| alternates\.hi/);
});

test('RSS is separated by locale and sourced from freshness-filtered articles', () => {
  assert.match(feed, /getLocalizedArticles\(locale\)/);
  assert.match(feed, /schemaLanguage\(locale\)/);
  assert.match(feed, /atom:link/);
  assert.match(rootFeed, /createLocalizedFeed\('en'\)/);
  assert.match(localeFeed, /\['bn', 'hi'\]/);
  assert.match(localeFeed, /createLocalizedFeed\(props\.locale as Locale\)/);
});

test('content-specific entities are emitted only through safe current actions', () => {
  assert.match(articleRoute, /import ArticleStructuredData/);
  assert.match(articleRoute, /applicationUrl=\{safeApplicationUrl\}/);
  assert.match(articleStructuredData, /'@type': 'JobPosting'/);
  assert.match(articleStructuredData, /'@type': 'GovernmentService'/);
  assert.match(articleStructuredData, /'@type': 'EducationalOccupationalProgram'/);
  assert.match(articleStructuredData, /'@type': 'SpecialAnnouncement'/);
  assert.match(articleStructuredData, /data\.job &&\s+applicationUrl/);
});

test('CI enforces generated canonical, hreflang, JSON-LD, sitemap and feed contracts', () => {
  assert.match(validator, /indexable page is not self-canonical/);
  assert.match(validator, /hreflang self-reference is missing or incorrect/);
  assert.match(validator, /noindex page entered sitemap/);
  assert.match(validator, /article schema is missing/);
  assert.match(validator, /contains an item from another language/);
  assert.match(packageJson, /"validate:seo": "node scripts\/validate-seo\.mjs"/);
  assert.match(workflow, /Canonical, hreflang and structured-data validation/);
  assert.match(workflow, /npm run validate:seo/);
});
