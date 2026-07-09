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

export async function getArticlesByAuthorSlug(authorSlug: string) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.filter((article) => article.data.author === authorSlug);
}
