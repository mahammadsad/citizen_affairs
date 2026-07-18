import { getCollection } from 'astro:content';
import { ACTIVE_CATEGORY_IDS, SITE } from '@utils/constants';
import { locales } from '../i18n';

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  const articles = await getCollection('articles', ({ data }) => !data.draft && ['published', 'corrected', 'closed'].includes(data.workflowStatus) && data.verificationStatus !== 'withdrawn' && ACTIVE_CATEGORY_IDS.includes(data.category));
  const categories = (await getCollection('categories')).filter((category) => ACTIVE_CATEGORY_IDS.includes(category.id));
  const staticPaths = ['', ...locales.flatMap(locale => [locale === 'en' ? null : `${locale}/`, `${locale}/articles/`, `${locale}/categories/`, `${locale}/deadlines/`, `${locale}/editorial-policy/`, `${locale}/privacy/`, `${locale}/terms/`, `${locale}/disclaimer/`]).filter((path): path is string => Boolean(path))];
  const trustPaths = ['about/', 'contact/', 'authors/mahammad-sad/', 'corrections/', ...['bn', 'hi'].flatMap((locale) => [`${locale}/about/`, `${locale}/contact/`, `${locale}/authors/mahammad-sad/`, `${locale}/corrections/`])];
  const paths: Array<{ path: string; lastmod?: Date }> = [
    ...staticPaths.map((path) => ({ path })),
    ...trustPaths.map((path) => ({ path })),
    ...articles.map((article) => ({ path: `${article.data.language}/articles/${article.data.urlSlug}/`, lastmod: article.data.updated ?? article.data.date })),
    ...locales.flatMap((locale) => categories.map((category) => ({ path: `${locale}/categories/${category.id}/` }))),
  ];
  const uniquePaths = [...new Map(paths.map((entry) => [entry.path, entry])).values()];
  const urls = uniquePaths.map(({ path, lastmod }) => `<url><loc>${escapeXml(`${SITE.url}/${path}`)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
