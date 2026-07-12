import { getCollection } from 'astro:content';
import { SITE } from '@utils/constants';

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const categories = await getCollection('categories');
  const staticPaths = ['en/', 'bn/', 'en/articles/', 'bn/articles/', 'en/categories/', 'bn/categories/', 'en/editorial-policy/', 'bn/editorial-policy/', 'en/privacy/', 'bn/privacy/', 'en/terms/', 'bn/terms/', 'en/disclaimer/', 'bn/disclaimer/'];
  const paths: Array<{ path: string; lastmod?: Date }> = [
    ...staticPaths.map((path) => ({ path })),
    ...articles.map((article) => ({ path: `${article.data.language}/articles/${article.data.urlSlug}/`, lastmod: article.data.updated ?? article.data.date })),
    ...(['en', 'bn'] as const).flatMap((locale) => categories.map((category) => ({ path: `${locale}/categories/${category.id}/` }))),
  ];
  const urls = paths.map(({ path, lastmod }) => `<url><loc>${escapeXml(`${SITE.url}/${path}`)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
