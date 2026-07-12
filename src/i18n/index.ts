export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string | undefined): value is Locale =>
  value === 'en' || value === 'bn';

export const UI = {
  en: {
    languageName: 'English',
    switchLanguage: 'বাংলা',
    home: 'Home',
    articles: 'Updates',
    categories: 'Categories',
    services: 'Services',
    community: 'Community',
    contact: 'Contact',
    search: 'Search',
    searchPlaceholder: 'Search updates, categories or tags…',
    searchHint: 'Start typing to find verified information.',
    noResults: 'No matching information found.',
    independent: 'Independent public-information platform',
    heroTitle: 'Verified government information, made easier to understand',
    heroDescription: 'Government jobs, welfare schemes, education notices, results and important public-service updates from West Bengal and India—clearly explained with official sources.',
    explore: 'Explore latest updates',
    joinTelegram: 'Join Telegram',
    joinWhatsApp: 'Follow WhatsApp',
    verifiedSources: 'Official sources linked',
    bilingual: 'English + Bengali',
    freeAccess: 'Always free to read',
    latest: 'Latest verified updates',
    latestDescription: 'Every published update includes its verification status, source and last checked date.',
    viewAll: 'View all updates',
    whatWeCover: 'What we cover',
    howItWorks: 'How information is verified',
    stepDiscover: 'Discover',
    stepVerify: 'Verify',
    stepExplain: 'Explain',
    stepUpdate: 'Update',
    communityTitle: 'Get important updates where you already are',
    disclaimerShort: 'Sarkari Tathya Kendra is an independent platform and is not affiliated with any government department.',
    updated: 'Updated',
    lastVerified: 'Last verified',
    source: 'Official source',
    apply: 'Open application portal',
    readMore: 'Read full update',
    articleCount: 'updates',
    noArticles: 'No published updates in this section yet.',
    allCategories: 'All categories',
    backToUpdates: 'Back to updates',
    verification: 'Verification status',
    closed: 'Application closed',
    privacy: 'Privacy Policy',
    disclaimer: 'Disclaimer',
    terms: 'Terms',
    editorial: 'Editorial Policy',
  },
  bn: {
    languageName: 'বাংলা',
    switchLanguage: 'English',
    home: 'হোম',
    articles: 'আপডেট',
    categories: 'বিভাগ',
    services: 'সেবাসমূহ',
    community: 'কমিউনিটি',
    contact: 'যোগাযোগ',
    search: 'সার্চ',
    searchPlaceholder: 'আপডেট, বিভাগ বা ট্যাগ খুঁজুন…',
    searchHint: 'যাচাইকৃত তথ্য খুঁজতে লেখা শুরু করুন।',
    noResults: 'মিলছে এমন কোনো তথ্য পাওয়া যায়নি।',
    independent: 'স্বাধীন জনতথ্য প্ল্যাটফর্ম',
    heroTitle: 'যাচাইকৃত সরকারি তথ্য এখন আরও সহজ ভাষায়',
    heroDescription: 'পশ্চিমবঙ্গ ও ভারতের সরকারি চাকরি, জনকল্যাণ প্রকল্প, শিক্ষা নোটিশ, ফলাফল ও জরুরি জনসেবা সংক্রান্ত তথ্য—অফিসিয়াল সূত্রসহ সহজভাবে উপস্থাপিত।',
    explore: 'সর্বশেষ আপডেট দেখুন',
    joinTelegram: 'Telegram-এ যুক্ত হন',
    joinWhatsApp: 'WhatsApp ফলো করুন',
    verifiedSources: 'অফিসিয়াল সূত্র যুক্ত',
    bilingual: 'বাংলা + English',
    freeAccess: 'সবসময় বিনামূল্যে',
    latest: 'সর্বশেষ যাচাইকৃত আপডেট',
    latestDescription: 'প্রতিটি প্রকাশিত তথ্যে যাচাইয়ের অবস্থা, সূত্র ও সর্বশেষ যাচাইয়ের তারিখ থাকবে।',
    viewAll: 'সব আপডেট দেখুন',
    whatWeCover: 'যেসব তথ্য পাবেন',
    howItWorks: 'যেভাবে তথ্য যাচাই করা হয়',
    stepDiscover: 'তথ্য সংগ্রহ',
    stepVerify: 'সূত্র যাচাই',
    stepExplain: 'সহজ ব্যাখ্যা',
    stepUpdate: 'পরিবর্তন আপডেট',
    communityTitle: 'আপনার পরিচিত প্ল্যাটফর্মেই গুরুত্বপূর্ণ আপডেট পান',
    disclaimerShort: 'সরকারি তথ্যকেন্দ্র একটি স্বাধীন প্ল্যাটফর্ম; কোনো সরকারি দপ্তরের সঙ্গে যুক্ত নয়।',
    updated: 'আপডেট',
    lastVerified: 'সর্বশেষ যাচাই',
    source: 'অফিসিয়াল সূত্র',
    apply: 'আবেদন পোর্টাল খুলুন',
    readMore: 'সম্পূর্ণ আপডেট পড়ুন',
    articleCount: 'টি আপডেট',
    noArticles: 'এই বিভাগে এখনো কোনো তথ্য প্রকাশিত হয়নি।',
    allCategories: 'সব বিভাগ',
    backToUpdates: 'আপডেটে ফিরে যান',
    verification: 'যাচাইয়ের অবস্থা',
    closed: 'আবেদন বন্ধ',
    privacy: 'Privacy Policy',
    disclaimer: 'দাবিত্যাগ',
    terms: 'ব্যবহারের শর্ত',
    editorial: 'সম্পাদনা নীতি',
  },
} as const;

export function ui(locale: Locale) {
  return UI[locale];
}

export function localizedPath(locale: Locale, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `/sarkari-tathya-kendra/${locale}/${clean}${clean ? '/' : ''}`;
}

export function replaceLocale(pathname: string, locale: Locale) {
  const base = '/sarkari-tathya-kendra/';
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments[0] = locale;
  else segments.unshift(locale);
  return `${base}${segments.join('/')}${pathname.endsWith('/') ? '/' : ''}`;
}

export const verificationLabels = {
  en: {
    'officially-confirmed': 'Officially confirmed',
    'under-verification': 'Under verification',
    corrected: 'Corrected',
    withdrawn: 'Withdrawn',
    closed: 'Closed',
  },
  bn: {
    'officially-confirmed': 'অফিসিয়ালভাবে নিশ্চিত',
    'under-verification': 'যাচাই চলছে',
    corrected: 'সংশোধিত',
    withdrawn: 'প্রত্যাহার করা হয়েছে',
    closed: 'বন্ধ',
  },
} as const;
