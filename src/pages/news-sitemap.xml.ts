import { getCollection } from 'astro:content';
import { isCurrentListingCandidate } from '@lib/freshness';
import { SITE } from '@utils/constants';

const NEWS_CATEGORIES = new Set(['jobs', 'exams', 'affairs', 'notices']);
const PUBLIC_WORKFLOWS = new Set(['published', 'corrected', 'closed']);
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_NEWS_URLS = 1000;

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const articleUrl = (language: 'en' | 'bn' | 'hi', slug: string) =>
  language === 'en'
    ? `${SITE.url}/articles/${slug}/`
    : `${SITE.url}/${language}/articles/${slug}/`;

export async function GET() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - TWO_DAYS_MS);
  const articles = (await getCollection(
    'articles',
    ({ data }) =>
      !data.draft &&
      PUBLIC_WORKFLOWS.has(data.workflowStatus) &&
      data.verificationStatus !== 'withdrawn' &&
      NEWS_CATEGORIES.has(data.category) &&
      isCurrentListingCandidate(data) &&
      data.date >= cutoff &&
      data.date <= now
  ))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, MAX_NEWS_URLS);

  const urls = articles.map((article) => {
    const language = article.data.language;
    const loc = articleUrl(language, article.data.urlSlug);
    return [
      '<url>',
      `<loc>${escapeXml(loc)}</loc>`,
      '<news:news>',
      '<news:publication>',
      '<news:name>Citizen Affairs</news:name>',
      `<news:language>${language}</news:language>`,
      '</news:publication>',
      `<news:publication_date>${article.data.date.toISOString()}</news:publication_date>`,
      `<news:title>${escapeXml(article.data.title)}</news:title>`,
      '</news:news>',
      '</url>',
    ].join('');
  }).join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
