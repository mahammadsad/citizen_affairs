import brand from '@brand';
type BrandLocale = 'en' | 'bn' | 'hi';

export const BRAND = brand;
export const GITHUB_PAGES_URL = 'https://mahammadsad.github.io/citizen_affairs';
const GITHUB_REPOSITORY_BASE = '/citizen_affairs/';
export const SITE_URL = BRAND.domain ? BRAND.domain.replace(/\/$/, '') : GITHUB_PAGES_URL;
export const BASE_PATH = BRAND.domain ? '/' : GITHUB_REPOSITORY_BASE;

export function getBrandName(locale: BrandLocale = 'en') {
  if (locale === 'bn') return BRAND.brandNameBn;
  if (locale === 'hi') return BRAND.brandNameHi;
  return BRAND.brandNameEn;
}

export function getBrandTagline(locale: BrandLocale = 'en') {
  if (locale === 'bn') return BRAND.brandTaglineBn;
  if (locale === 'hi') return BRAND.brandTaglineHi;
  return BRAND.brandTaglineEn;
}

export const ACTIVE_CATEGORY_IDS = BRAND.activeCategoryIds as readonly string[];
export const isActiveCategory = (categoryId: string) => ACTIVE_CATEGORY_IDS.includes(categoryId);

export function withBasePath(path = '') {
  return `${BASE_PATH}${path.replace(/^\/+/, '')}`;
}

export function resolveAssetPath(path: string) {
  if (/^(?:https?:|data:|blob:)/.test(path)) return path;
  const relativePath = path.startsWith(GITHUB_REPOSITORY_BASE)
    ? path.slice(GITHUB_REPOSITORY_BASE.length)
    : path.replace(/^\/+/, '');
  return withBasePath(relativePath);
}

export const SITE = {
  name: getBrandName('en'),
  nameEn: getBrandName('en'),
  nameBn: getBrandName('bn'),
  nameHi: getBrandName('hi'),
  shortName: BRAND.brandShortName,
  tagline: getBrandTagline('en'),
  taglineEn: BRAND.brandTaglineEn,
  taglineBn: BRAND.brandTaglineBn,
  taglineHi: BRAND.brandTaglineHi,
  description: BRAND.description,
  url: SITE_URL,
  basePath: BASE_PATH,
  logo: withBasePath(BRAND.logo),
  ogImage: withBasePath(BRAND.logoSocialCard),
  author: {
    name: 'Citizen Affairs Editorial Desk',
    role: 'Publication desk',
    bio: 'Source-linked public-information publishing in English, Bengali and Hindi.',
    email: BRAND.contactEmail
  }
} as const;

export const ADS = { enabled: false, publisherId: '' } as const;

export const SOCIALS = {
  x: 'https://x.com/citizenaffairIn',
  facebook: 'https://www.facebook.com/profile.php?id=61593098155563',
  telegram: 'https://t.me/CitizenAffairsBangla',
  telegramMCQ: 'https://t.me/BongCompetitiveExam',
  whatsapp: 'https://whatsapp.com/channel/0029Vb8NQAX9cDDTfaEDwk3r',
  email: BRAND.contactEmail
} as const;
