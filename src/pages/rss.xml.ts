import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@utils/constants';

/** Escapes text for safe inclusion inside XML nodes. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// SITE.url already includes the GitHub Pages repo path (e.g. "https://user.github.io/repo"),
// so the absolute site root is just SITE.url + a trailing slash — do NOT also append
// SITE.basePath here, or the repo path ends up duplicated in every URL.
const siteRoot = `${SITE.url}/`;

export async function get(_context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const sorted = articles.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const items = sorted
    .map((article) => {
      const link = `${siteRoot}articles/${article.slug}/`;
      const pubDate = new Date(article.data.date).toUTCString();
      return `    <item>
      <title>${escapeXml(article.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(article.data.description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${siteRoot}</link>
    <atom:link href="${siteRoot}rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
