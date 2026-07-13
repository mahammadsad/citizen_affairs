import brand from '@brand';

export const BRAND = brand;
export const GITHUB_PAGES_URL = 'https://mahammadsad.github.io/sarkari-tathya-kendra';
export const SITE_URL = BRAND.domain ? BRAND.domain.replace(/\/$/, '') : GITHUB_PAGES_URL;
export const BASE_PATH = BRAND.domain ? '/' : '/sarkari-tathya-kendra/';

export function getBrandTagline(locale: 'en' | 'bn' | 'hi') {
  if (locale === 'bn') return BRAND.brandTaglineBn;
  if (locale === 'hi') return BRAND.brandTaglineHi;
  return BRAND.brandTagline;
}

export const SITE = {
  name: BRAND.brandName,
  nameEn: BRAND.brandName,
  nameBn: BRAND.brandName,
  nameHi: BRAND.brandName,
  shortName: BRAND.brandShortName,
  tagline: BRAND.brandTagline,
  taglineEn: BRAND.brandTagline,
  taglineBn: BRAND.brandTaglineBn,
  taglineHi: BRAND.brandTaglineHi,
  description: 'Verified Central and State Government jobs, welfare schemes, education, exams and public-service updates from across India.',
  url: SITE_URL,
  basePath: BASE_PATH,
  logo: `${BASE_PATH}assets/logo-mark.svg`,
  ogImage: `${BASE_PATH}assets/og-image.jpg`,
  author: {
    name: 'Mahammad Sad',
    role: 'Programmer and Mathematician',
    bio: 'Interested in AI automation, technology, business, startups, investing and computer science.',
    email: BRAND.contactEmail,
    github: 'https://github.com/mahammadsad'
  }
} as const;

export const ADS = { enabled: false, publisherId: '' } as const;

export const SOCIALS = {
  telegram: 'https://t.me/SarkariTathyaKendra',
  telegramMCQ: 'https://t.me/BongCompetitiveExam',
  whatsapp: 'https://whatsapp.com/channel/0029Vb8NQAX9cDDTfaEDwk3r',
  email: BRAND.contactEmail
} as const;
