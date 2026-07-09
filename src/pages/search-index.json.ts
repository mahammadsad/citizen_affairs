import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getCategoryData } from '@lib/content';
import { SITE } from '@utils/constants';
import type { SearchItem } from '@lib/search';

/**
 * Site-wide search index, generated once at build time and fetched by the
 * client on first search open (see SearchOverlay.astro). Covers every
 * published article's title, category, tags and description — unlike the
 * old DOM-scraping approach this replaces, it isn't limited to whatever
 * happens to be rendered on the current page.
 */
export async function get(_context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);

  const items: SearchItem[] = await Promise.all(
    articles.map(async (article) => {
      const category = await getCategoryData(article.data.category);
      return {
        label: article.data.title,
        sub: category?.data.name ?? article.data.category,
        href: `${SITE.basePath}articles/${article.slug}/`,
        keywords: [article.data.description, ...article.data.tags],
      };
    })
  );

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
