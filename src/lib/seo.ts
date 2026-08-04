import { getBrandName, SITE } from '@utils/constants';

export type SeoLocale = 'en' | 'bn' | 'hi';

export const SCHEMA_IDS = {
  organization: `${SITE.url}/#organization`,
  website: `${SITE.url}/#website`,
} as const;

export interface SEOMeta {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

export interface ArticleSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  inLanguage?: string;
  articleSection?: string;
  keywords?: string[];
  isAccessibleForFree: boolean;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    '@id': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

/**
 * Converts a path to an absolute URL without duplicating a configured base path.
 */
export function toAbsoluteUrl(path: string, siteUrl: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = new URL(siteUrl).origin;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

export function normalizeCanonicalUrl(value: string, siteUrl: string): string {
  const production = new URL(siteUrl);
  const incoming = new URL(value, production);
  const pathname = incoming.pathname === '/' ? '/' : `${incoming.pathname.replace(/\/+$/, '')}/`;
  return `${production.origin}${pathname}`;
}

export function localizedFeedUrl(locale: SeoLocale): string {
  return locale === 'en' ? `${SITE.url}/rss.xml` : `${SITE.url}/${locale}/rss.xml`;
}

export function schemaLanguage(locale: SeoLocale): string {
  return locale === 'bn' ? 'bn-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
}

export function generateMeta(seo: SEOMeta) {
  const {
    title,
    description,
    image,
    imageAlt,
    url,
    canonical,
    ogType = 'website',
    twitterCard = 'summary_large_image',
  } = seo;

  return {
    title,
    description,
    canonical: canonical || url,
    openGraph: {
      basic: {
        type: ogType,
        title,
        image,
        url,
      },
      image: {
        alt: imageAlt || title,
      },
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      image,
    },
  };
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateBengali(date: Date): string {
  const formatter = new Intl.DateTimeFormat('bn-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateBreadcrumbs(
  segments: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.name,
      ...(segment.url && { item: segment.url }),
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
  author: string;
  authorUrl?: string;
  url: string;
  language?: string;
  section?: string;
  keywords?: string[];
  schemaType?: 'Article' | 'NewsArticle';
}): ArticleSchema {
  const canonical = normalizeCanonicalUrl(article.url, SITE.url);
  return {
    '@context': 'https://schema.org',
    '@type': article.schemaType || 'Article',
    '@id': `${canonical}#article`,
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished.toISOString(),
    dateModified: (article.dateModified || article.datePublished).toISOString(),
    inLanguage: article.language,
    articleSection: article.section,
    keywords: article.keywords?.length ? article.keywords : undefined,
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
    },
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': SCHEMA_IDS.organization,
      name: getBrandName('en'),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(SITE.logo, SITE.url),
      },
    },
  };
}
