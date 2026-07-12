import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@utils/constants';

export async function GET() {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return rss({
    title: 'Sarkari Tathya Kendra',
    description: 'Verified government jobs, schemes, education notices and public-service information in English and Bengali.',
    site: `${SITE.url}/`,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: `${article.data.language}/articles/${article.data.urlSlug}/`,
    })),
    customData: '<language>en-IN</language>',
  });
}
