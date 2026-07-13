import { getBrandName, SITE } from '@utils/constants';

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
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  author: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
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
 * Converts a path to an absolute URL.
 *
 * Site-relative asset paths in this project (SITE.ogImage, SITE.logo, CMS
 * image uploads, etc.) already include the GitHub Pages base path, e.g.
 * "/sarkari-tathya-kendra/assets/og-image.jpg". SITE.url *also* already
 * includes that same base path. Naively concatenating SITE.url + path
 * therefore duplicates the repo path in every generated absolute URL
 * (og:image, JSON-LD logos, etc. all did this before this fix).
 *
 * The correct fix is to prepend only the domain origin (no path) to
 * paths that already carry the base path themselves.
 */
export function toAbsoluteUrl(path: string, siteUrl: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = new URL(siteUrl).origin;
  return `${origin}${path}`;
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
    // Keep letters/numbers from any script (Bengali included) and spaces/hyphens;
    // strip punctuation only. The previous \w-based regex was ASCII-only and
    // silently stripped all Bengali characters, producing empty slugs.
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
  url: string;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished.toISOString(),
    dateModified: article.dateModified?.toISOString() || article.datePublished.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: getBrandName('en'),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(SITE.logo, SITE.url),
      },
    },
  };
}
