import { getCollection } from 'astro:content';
import { categoryName, getCategoryData } from '@lib/content';
import { SITE } from '@utils/constants';
import { locales, verificationLabels, type Locale } from '../../i18n';
import { deadlineState } from '@lib/deadline';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang }, props: { locale: lang } }));
}

export async function GET({ props }: { props: { locale: Locale } }) {
  const { locale } = props;
  const articles = await getCollection('articles', ({ data }) => !data.draft && data.language === locale && data.verificationStatus !== 'withdrawn');
  const items = await Promise.all(articles.map(async (article) => {
    const category = await getCategoryData(article.data.category);
    return {
      label: article.data.title,
      sub: category ? categoryName(category, locale) : article.data.category,
      category: category ? categoryName(category, locale) : article.data.category,
      verification: verificationLabels[locale][article.data.verificationStatus],
      status: deadlineState(article.data.deadline),
      href: `${SITE.basePath}${locale}/articles/${article.data.urlSlug}/`,
      keywords: [article.data.description, article.data.qualification || '', article.data.governmentLevel || '', ...article.data.tags],
    };
  }));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
