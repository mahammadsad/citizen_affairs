import { getCollection } from 'astro:content';
import { categoryName, getCategoryData } from '@lib/content';
import { SITE } from '@utils/constants';
import type { Locale } from '../../i18n';

export function getStaticPaths() {
  return (['en', 'bn'] as Locale[]).map((lang) => ({ params: { lang }, props: { locale: lang } }));
}

export async function GET({ props }: { props: { locale: Locale } }) {
  const { locale } = props;
  const articles = await getCollection('articles', ({ data }) => !data.draft && data.language === locale);
  const items = await Promise.all(articles.map(async (article) => {
    const category = await getCategoryData(article.data.category);
    return {
      label: article.data.title,
      sub: category ? categoryName(category, locale) : article.data.category,
      href: `${SITE.basePath}${locale}/articles/${article.data.urlSlug}/`,
      keywords: [article.data.description, ...article.data.tags],
    };
  }));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
