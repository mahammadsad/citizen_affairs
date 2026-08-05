import { getCollection } from 'astro:content';
import { isCurrentListingCandidate } from '@lib/freshness';
import { ACTIVE_CATEGORY_IDS, SITE } from '@utils/constants';
import { locales, type Locale } from '../i18n';

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

type LocaleUrls = Partial<Record<Locale, string>>;
interface SitemapEntry {
  loc: string;
  alternates: LocaleUrls;
  lastmod?: Date;
}

const localizedUrl = (locale: Locale, route = '', englishAtRoot = false) => {
  if (!route) return locale === 'en' ? `${SITE.url}/` : `${SITE.url}/${locale}/`;
  if (locale === 'en' && englishAtRoot) return `${SITE.url}/${route}/`;
  return `${SITE.url}/${locale}/${route}/`;
};

const localeCluster = (route = '', englishAtRoot = false): LocaleUrls => Object.fromEntries(
  locales.map((locale) => [locale, localizedUrl(locale, route, englishAtRoot)])
) as LocaleUrls;

const latestDate = (...dates: Array<Date | undefined>) => {
  const valid = dates.filter((date): date is Date => Boolean(date));
  return valid.length ? new Date(Math.max(...valid.map((date) => date.getTime()))) : undefined;
};

const createClusterEntries = (
  alternates: LocaleUrls,
  lastmods: Partial<Record<Locale, Date | undefined>> = {},
): SitemapEntry[] => locales.flatMap((locale) => {
  const loc = alternates[locale];
  return loc ? [{ loc, alternates, lastmod: lastmods[locale] }] : [];
});

export async function GET() {
  const articles = await getCollection(
    'articles',
    ({ data }) =>
      !data.draft &&
      ['published', 'corrected', 'closed'].includes(data.workflowStatus) &&
      data.verificationStatus !== 'withdrawn' &&
      ACTIVE_CATEGORY_IDS.includes(data.category) &&
      isCurrentListingCandidate(data)
  );
  const categories = (await getCollection('categories')).filter((category) =>
    ACTIVE_CATEGORY_IDS.includes(category.id)
  );

  const staticClusters = [
    localeCluster(),
    localeCluster('articles'),
    localeCluster('categories'),
    localeCluster('deadlines'),
    localeCluster('editorial-policy'),
    localeCluster('privacy'),
    localeCluster('terms'),
    localeCluster('disclaimer'),
    localeCluster('about', true),
    localeCluster('contact', true),
    localeCluster('careers', true),
    localeCluster('corrections', true),
    localeCluster('authors/mahammad-sad', true),
  ];

  const entries: SitemapEntry[] = staticClusters.flatMap((cluster) =>
    createClusterEntries(cluster)
  );

  for (const category of categories) {
    entries.push(...createClusterEntries(localeCluster(`categories/${category.id}`)));
  }

  const translationGroups = new Map<string, typeof articles>();
  for (const article of articles) {
    const group = translationGroups.get(article.data.translationKey) || [];
    group.push(article);
    translationGroups.set(article.data.translationKey, group);
  }

  for (const group of translationGroups.values()) {
    const alternates = Object.fromEntries(
      group.map((article) => [
        article.data.language,
        localizedUrl(
          article.data.language,
          `articles/${article.data.urlSlug}`,
          true
        ),
      ])
    ) as LocaleUrls;
    const lastmods = Object.fromEntries(
      group.map((article) => [
        article.data.language,
        latestDate(article.data.date, article.data.updated, article.data.lastVerified),
      ])
    ) as Partial<Record<Locale, Date | undefined>>;
    entries.push(...createClusterEntries(alternates, lastmods));
  }

  const uniqueEntries = [...new Map(entries.map((entry) => [entry.loc, entry])).values()];
  const urls = uniqueEntries.map(({ loc, alternates, lastmod }) => {
    const alternateLinks = locales
      .filter((locale) => Boolean(alternates[locale]))
      .map((locale) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(alternates[locale]!)}" />`)
      .join('');
    const xDefault = alternates.en || alternates.bn || alternates.hi || loc;
    return `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}${alternateLinks}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault)}" /></url>`;
  }).join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
