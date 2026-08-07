import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');
const articleSchema = await readFile('src/components/ArticleStructuredData.astro', 'utf8');
const publicationMeta = await readFile('src/components/ArticlePublicationMeta.astro', 'utf8');
const englishArticleRoute = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedArticleRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const newsSitemap = await readFile('src/pages/news-sitemap.xml.ts', 'utf8');
const robots = await readFile('src/pages/robots.txt.ts', 'utf8');
const cms = parse(await readFile('.pages.yml', 'utf8'));
const articleQualityAudit = await readFile('scripts/audit-article-quality.mjs', 'utf8');

test('indexable pages allow large image previews for Google Discover', () => {
  assert.match(baseLayout, /index, follow, max-image-preview:large/);
});

test('news-like citizen updates emit NewsArticle with rich image metadata', () => {
  assert.match(articleSchema, /newsCategories = new Set\(\['jobs', 'exams', 'affairs', 'notices'\]\)/);
  assert.match(articleSchema, /\? 'NewsArticle'/);
  assert.match(articleSchema, /'@type': 'ImageObject'/);
  assert.match(articleSchema, /width: data\.featuredImageWidth/);
  assert.match(articleSchema, /height: data\.featuredImageHeight/);
  assert.match(articleSchema, /caption: data\.featuredImageCaption \|\| data\.featuredImageAlt \|\| data\.title/);
  assert.match(articleSchema, /creditText: data\.featuredImageCredit/);
});

test('articles expose visible publication metadata with real timestamps and an editorial byline fallback', () => {
  assert.match(publicationMeta, /<time datetime=\{date\.toISOString\(\)\}>/);
  assert.match(publicationMeta, /timeZone: 'Asia\/Kolkata'/);
  assert.match(publicationMeta, /hasExplicitTime/);
  assert.match(publicationMeta, /Editorial Desk/);
  assert.match(publicationMeta, /locale === 'en' \? '\/team\/' : localizedPath\(locale, 'team'\)/);
  assert.match(englishArticleRoute, /<ArticlePublicationMeta/);
  assert.match(localizedArticleRoute, /<ArticlePublicationMeta/);
});

test('Google News sitemap contains only fresh public news-category articles', () => {
  assert.match(newsSitemap, /schemas\/sitemap-news\/0\.9/);
  assert.match(newsSitemap, /2 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(newsSitemap, /MAX_NEWS_URLS = 1000/);
  assert.match(newsSitemap, /!data\.draft/);
  assert.match(newsSitemap, /PUBLIC_WORKFLOWS\.has\(data\.workflowStatus\)/);
  assert.match(newsSitemap, /data\.verificationStatus !== 'withdrawn'/);
  assert.match(newsSitemap, /NEWS_CATEGORIES\.has\(data\.category\)/);
  assert.match(newsSitemap, /isCurrentListingCandidate\(data\)/);
  assert.match(newsSitemap, /data\.date >= cutoff/);
  assert.match(newsSitemap, /data\.date <= now/);
  assert.match(newsSitemap, /<news:publication_date>/);
  assert.match(newsSitemap, /<news:title>/);
  assert.match(robots, /news-sitemap\.xml/);
});

test('desktop draft CMS keeps the editorial SEO controls needed before publication', () => {
  const draftGroup = cms.content.find((entry) => entry.name === 'draft-articles');
  assert.ok(draftGroup);
  assert.equal(draftGroup.items.length, 3);

  for (const collection of draftGroup.items) {
    const fields = new Set(collection.fields.map((field) => field.name));
    for (const requiredField of [
      'title',
      'description',
      'urlSlug',
      'tags',
      'featuredImage',
      'featuredImageAlt',
      'seoTitle',
      'seoDescription',
      'quickSummary',
      'faqs',
      'sourceUrls',
      'verificationStatus',
      'body',
    ]) {
      assert.ok(fields.has(requiredField), `${collection.name} must expose ${requiredField}`);
    }
  }
});

test('public article quality gate rejects weak structure and clickbait patterns', () => {
  assert.match(articleQualityAudit, /clickbaitPatterns/);
  assert.match(articleQualityAudit, /quickSummary must contain 2 to 5 useful points/);
  assert.match(articleQualityAudit, /long article needs at least two descriptive H2 sections/);
  assert.match(articleQualityAudit, /headline uses clickbait wording/);
});
