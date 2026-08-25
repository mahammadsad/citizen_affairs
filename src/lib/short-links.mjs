const ARTICLE_LOCALES = new Set(['en', 'bn', 'hi']);
const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const shortLinks = Object.freeze([
  {
    slug: 'sbi',
    target: '/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — English',
  },
  {
    slug: 'sbi-bn',
    target: '/bn/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — Bengali',
  },
  {
    slug: 'sbi-hi',
    target: '/hi/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — Hindi',
  },
  {
    slug: 'rrb',
    target: '/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — English',
  },
  {
    slug: 'rrb-bn',
    target: '/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — Bengali',
  },
  {
    slug: 'rrb-hi',
    target: '/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — Hindi',
  },
]);

export function getShortLink(slug) {
  return shortLinks.find((entry) => entry.slug === slug) ?? null;
}

export function articleTargetPath(locale, urlSlug) {
  if (!ARTICLE_LOCALES.has(locale)) {
    throw new Error(`Unsupported article locale for short link: ${locale}`);
  }
  if (!ARTICLE_SLUG_PATTERN.test(urlSlug)) {
    throw new Error(`Unsafe article slug for short link: ${urlSlug}`);
  }

  return locale === 'en'
    ? `/articles/${urlSlug}/`
    : `/${locale}/articles/${urlSlug}/`;
}

export function articleShortCode(locale, urlSlug) {
  const target = articleTargetPath(locale, urlSlug);
  let hash = 2166136261;

  for (let index = 0; index < target.length; index += 1) {
    hash ^= target.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `a${(hash >>> 0).toString(36)}`;
}

export function getPreferredShortLink(locale, urlSlug) {
  const target = articleTargetPath(locale, urlSlug);
  const curated = shortLinks.find((entry) => entry.target === target);

  return curated ?? {
    slug: articleShortCode(locale, urlSlug),
    target,
    label: `${locale.toUpperCase()} article — ${urlSlug}`,
  };
}

export function shortPathForArticle(locale, urlSlug) {
  return `/go/${getPreferredShortLink(locale, urlSlug).slug}/`;
}
