import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getAllTags } from '@lib/content';
import { SITE } from '@utils/constants';

// SITE.url already includes the GitHub Pages repo path (e.g. "https://user.github.io/repo"),
// so the absolute site root is just SITE.url + a trailing slash — do NOT also append
// SITE.basePath here, or the repo path ends up duplicated in every URL.
const siteRoot = `${SITE.url}/`;

interface SitemapEntry {
  path: string; // relative, trailing slash, no leading slash (e.g. "articles/my-post/")
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  lastmod?: Date;
}

export async function get(_context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const categories = await getCollection('categories');
  const authors = await getCollection('authors');
  const tags = await getAllTags();

  const entries: SitemapEntry[] = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: 'articles/', changefreq: 'daily', priority: '0.9' },
    { path: 'categories/', changefreq: 'weekly', priority: '0.6' },
    { path: 'tags/', changefreq: 'weekly', priority: '0.5' },
    { path: 'privacy/', changefreq: 'monthly', priority: '0.3' },
    { path: 'terms/', changefreq: 'monthly', priority: '0.3' },
    { path: 'disclaimer/', changefreq: 'monthly', priority: '0.3' },
    ...articles.map((article) => ({
      path: `articles/${article.slug}/`,
      changefreq: 'weekly' as const,
      priority: '0.8',
      lastmod: article.data.updated ?? article.data.date,
    })),
    ...categories.map((category) => ({
      path: `categories/${category.id}/`,
      changefreq: 'weekly' as const,
      priority: '0.6',
    })),
    ...tags.map(({ slug }) => ({
      path: `tags/${slug}/`,
      changefreq: 'weekly' as const,
      priority: '0.5',
    })),
    ...authors.map((author) => ({
      path: `authors/${author.id}/`,
      changefreq: 'monthly' as const,
      priority: '0.5',
    })),
  ];

  const urls = entries
    .map((entry) => {
      const loc = `${siteRoot}${entry.path}`;
      const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod.toISOString().split('T')[0]}</lastmod>` : '';
      return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
