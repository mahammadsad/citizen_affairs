import rss from '@astrojs/rss';
import { getLocalizedArticles } from '@lib/content';
import { localizedFeedUrl, schemaLanguage } from '@lib/seo';
import { getBrandName, getBrandTagline, SITE } from '@utils/constants';
import type { Locale } from '../i18n';

const articleUrl = (locale: Locale, slug: string) =>
  locale === 'en'
    ? `${SITE.url}/articles/${slug}/`
    : `${SITE.url}/${locale}/articles/${slug}/`;

export async function createLocalizedFeed(locale: Locale) {
  const articles = await getLocalizedArticles(locale);
  const feedUrl = localizedFeedUrl(locale);

  return rss({
    title: getBrandName(locale),
    description: getBrandTagline(locale),
    site: `${SITE.url}/`,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.updated || article.data.date,
      link: articleUrl(article.data.language, article.data.urlSlug),
      author: article.data.author,
      categories: [article.data.category, ...article.data.tags],
    })),
    customData: `<language>${schemaLanguage(locale)}</language><atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
  });
}
