/**
 * Content Collection lookup helpers
 *
 * Articles store `category` and `author` as slugs (matching the filename
 * in src/content/categories/*.yaml and src/content/authors/*.yaml).
 * These helpers resolve a slug back to its full entry so pages/components
 * can display the human-readable name, description, color, etc.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { slugify } from './seo';
import type { Locale } from '../i18n';
import { isActiveCategory } from '@utils/constants';
import { compareArticleFreshness, isCurrentListingCandidate } from './freshness';

const isPublicWorkflow = (status: CollectionEntry<'articles'>['data']['workflowStatus']) =>
  ['published', 'corrected', 'closed'].includes(status);

const isPublicArticle = (data: CollectionEntry<'articles'>['data']) =>
  !data.draft &&
  isPublicWorkflow(data.workflowStatus) &&
  data.verificationStatus !== 'withdrawn' &&
  isActiveCategory(data.category);

export async function getCategoryData(slug: string): Promise<CollectionEntry<'categories'> | undefined> {
  return getEntry('categories', slug);
}

export async function getAuthorData(slug: string): Promise<CollectionEntry<'authors'> | undefined> {
  return getEntry('authors', slug);
}

/**
 * Returns every distinct tag used across all non-draft articles,
 * paired with the slug used in its URL (/tags/{slug}/).
 */
export async function getAllTags(): Promise<Array<{ tag: string; slug: string }>> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const seen = new Map<string, string>();

  for (const article of articles) {
    for (const tag of article.data.tags) {
      const slug = slugify(tag);
      if (!seen.has(slug)) seen.set(slug, tag);
    }
  }

  return Array.from(seen.entries()).map(([slug, tag]) => ({ tag, slug }));
}

export async function getArticlesByTagSlug(tagSlug: string) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.filter((article) => article.data.tags.some((tag) => slugify(tag) === tagSlug));
}

export async function getArticlesByCategorySlug(categorySlug: string) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.filter((article) => article.data.category === categorySlug);
}

export async function getAllLocalizedPublicArticles(locale: Locale) {
  const articles = await getCollection(
    'articles',
    ({ data }) => isPublicArticle(data) && data.language === locale,
  );
  return articles.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * Current discovery surfaces intentionally exclude expired opportunities.
 * Their article URLs remain available through `getAllLocalizedPublicArticles`
 * so corrections, results and historical context are not lost.
 */
export async function getLocalizedArticles(locale: Locale) {
  const now = new Date();
  const articles = (await getAllLocalizedPublicArticles(locale)).filter((article) =>
    isCurrentListingCandidate(article.data, now),
  );
  return articles.sort((a, b) => compareArticleFreshness(a.data, b.data, now));
}

export async function getLocalizedArticle(locale: Locale, slug: string) {
  const articles = await getAllLocalizedPublicArticles(locale);
  return articles.find((article) => article.data.urlSlug === slug);
}

export async function getArticleTranslation(translationKey: string, locale: Locale) {
  const articles = await getAllLocalizedPublicArticles(locale);
  return articles.find((article) => article.data.translationKey === translationKey);
}

export async function getLocalizedArticlesByCategory(locale: Locale, category: string) {
  const articles = await getLocalizedArticles(locale);
  return articles.filter((article) => article.data.category === category);
}

export function categoryName(category: CollectionEntry<'categories'>, locale: Locale) {
  if (locale === 'bn') return category.data.nameBn;
  if (locale === 'hi') return category.data.nameHi || category.data.nameEn;
  return category.data.nameEn;
}

export function categoryDescription(category: CollectionEntry<'categories'>, locale: Locale) {
  if (locale === 'bn') return category.data.descriptionBn;
  if (locale === 'hi') return category.data.descriptionHi || category.data.descriptionEn;
  return category.data.descriptionEn;
}

export async function getUpcomingDeadlines(locale: Locale, limit?: number) {
  const now = Date.now();
  const articles = (await getLocalizedArticles(locale)).filter(
    (article) => article.data.deadline && !Number.isNaN(article.data.deadline.getTime()),
  );
  articles.sort((a, b) => {
    const aTime = a.data.deadline!.getTime();
    const bTime = b.data.deadline!.getTime();
    const aClosed = aTime < now;
    const bClosed = bTime < now;
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    return aClosed ? bTime - aTime : aTime - bTime;
  });
  return typeof limit === 'number' ? articles.slice(0, limit) : articles;
}

export async function getRelatedArticles(locale: Locale, category: string, excludeSlug: string, limit = 3) {
  return (await getLocalizedArticlesByCategory(locale, category))
    .filter((article) => article.data.urlSlug !== excludeSlug)
    .slice(0, limit);
}

export async function getArticlesByAuthorSlug(authorSlug: string) {
  const articles = await getCollection('articles', ({ data }) => isPublicArticle(data));
  return articles.filter((article) => article.data.author === authorSlug);
}
