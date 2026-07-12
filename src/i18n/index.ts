import { BASE_PATH } from '@utils/constants';

export const locales = ['en', 'bn', 'hi'] as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { name: string; nativeName: string; code: string; intl: string }> = {
  en: { name: 'English', nativeName: 'English', code: 'EN', intl: 'en-IN' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', code: 'BN', intl: 'bn-IN' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', code: 'HI', intl: 'hi-IN' }
};

export const isLocale = (value: string | undefined): value is Locale => locales.includes(value as Locale);

const shared = {
  privacy: 'Privacy Policy',
  terms: 'Terms',
  editorial: 'Editorial Policy'
};

export const UI = {
  en: {
    ...shared,
    home: 'Home', latestNav: 'Latest Updates', articles: 'Updates', categories: 'Categories', about: 'About',
    services: 'Services', community: 'Community', contact: 'Contact', search: 'Search', close: 'Close', menu: 'Menu',
    searchPlaceholder: 'Search jobs, schemes, admit cards, results…', searchHint: 'Search verified public information.', noResults: 'No matching information found.',
    independent: 'Independent information platform', heroTitle: 'Verified Government Jobs, Schemes and Exam Updates',
    heroDescription: 'Official-source updates from West Bengal and across India, explained clearly in English, Bengali and Hindi.',
    explore: 'Explore Latest Updates', joinTelegram: 'Join Telegram', joinWhatsApp: 'WhatsApp Updates', verifiedSources: 'Official sources',
    threeLanguages: 'Three languages', freeAccess: 'Free access', regularlyUpdated: 'Regularly updated', latest: 'Latest Updates',
    latestDescription: 'Clear summaries with verification status, dates and official sources.', viewAll: 'View all updates', whatWeCover: 'Browse by category',
    howItWorks: 'How we verify information', stepDiscover: 'Official source', stepVerify: 'Fact check', stepExplain: 'Clear explanation', stepUpdate: 'Update tracking',
    communityTitle: 'Stay updated where you already are', disclaimerShort: 'Independent information platform. Not affiliated with any government department.',
    updated: 'Updated', published: 'Published', lastVerified: 'Last verified', source: 'Official source', apply: 'Official Website', readMore: 'View Details',
    articleCount: 'updates', noArticles: 'No published updates here yet.', allCategories: 'All categories', backToUpdates: 'Back to updates', verification: 'Verification status',
    closed: 'Closed', disclaimer: 'Disclaimer', deadlines: 'Upcoming Deadlines', saved: 'Saved articles', recent: 'Recently viewed', save: 'Save for later', savedLabel: 'Saved', share: 'Share',
    popularServices: 'Popular schemes and services', stayUpdated: 'Stay updated', stayUpdatedText: 'Receive important government information and deadline alerts.',
    latestTicker: 'Latest Updates', demoVersion: 'Demo version', copyEmail: 'Copy email', copied: 'Copied', officialLinks: 'Official links and sources'
  },
  bn: {
    ...shared,
    home: 'হোম', latestNav: 'সর্বশেষ আপডেট', articles: 'আপডেট', categories: 'বিভাগ', about: 'আমাদের সম্পর্কে',
    services: 'সেবা', community: 'কমিউনিটি', contact: 'যোগাযোগ', search: 'সার্চ', close: 'বন্ধ করুন', menu: 'মেনু',
    searchPlaceholder: 'চাকরি, প্রকল্প, অ্যাডমিট কার্ড, ফলাফল খুঁজুন…', searchHint: 'যাচাইকৃত জনতথ্য খুঁজুন।', noResults: 'মিলছে এমন তথ্য পাওয়া যায়নি।',
    independent: 'স্বাধীন তথ্য প্ল্যাটফর্ম', heroTitle: 'যাচাইকৃত সরকারি চাকরি, প্রকল্প ও পরীক্ষার আপডেট',
    heroDescription: 'পশ্চিমবঙ্গ ও সমগ্র ভারতের অফিসিয়াল সূত্রভিত্তিক আপডেট—English, বাংলা ও हिन्दी ভাষায় সহজ ব্যাখ্যা।',
    explore: 'সর্বশেষ আপডেট দেখুন', joinTelegram: 'Telegram-এ যুক্ত হন', joinWhatsApp: 'WhatsApp আপডেট', verifiedSources: 'অফিসিয়াল সূত্র',
    threeLanguages: 'তিনটি ভাষা', freeAccess: 'বিনামূল্যে', regularlyUpdated: 'নিয়মিত আপডেট', latest: 'সর্বশেষ আপডেট',
    latestDescription: 'যাচাইয়ের অবস্থা, গুরুত্বপূর্ণ তারিখ ও অফিসিয়াল সূত্রসহ সহজ সারাংশ।', viewAll: 'সব আপডেট দেখুন', whatWeCover: 'বিভাগ অনুযায়ী দেখুন',
    howItWorks: 'যেভাবে তথ্য যাচাই করি', stepDiscover: 'অফিসিয়াল সূত্র', stepVerify: 'তথ্য যাচাই', stepExplain: 'সহজ ব্যাখ্যা', stepUpdate: 'আপডেট ট্র্যাকিং',
    communityTitle: 'আপনার পরিচিত প্ল্যাটফর্মেই আপডেট পান', disclaimerShort: 'স্বাধীন তথ্য প্ল্যাটফর্ম। কোনো সরকারি দপ্তরের সঙ্গে যুক্ত নয়।',
    updated: 'আপডেট', published: 'প্রকাশিত', lastVerified: 'সর্বশেষ যাচাই', source: 'অফিসিয়াল সূত্র', apply: 'অফিসিয়াল ওয়েবসাইট', readMore: 'বিস্তারিত দেখুন',
    articleCount: 'টি আপডেট', noArticles: 'এখানে এখনো কোনো তথ্য প্রকাশিত হয়নি।', allCategories: 'সব বিভাগ', backToUpdates: 'আপডেটে ফিরে যান', verification: 'যাচাইয়ের অবস্থা',
    closed: 'বন্ধ', disclaimer: 'দাবিত্যাগ', deadlines: 'আসন্ন সময়সীমা', saved: 'সংরক্ষিত আর্টিকেল', recent: 'সম্প্রতি দেখা', save: 'পরে পড়ার জন্য রাখুন', savedLabel: 'সংরক্ষিত', share: 'শেয়ার',
    popularServices: 'জনপ্রিয় প্রকল্প ও পরিষেবা', stayUpdated: 'আপডেট পেতে সঙ্গে থাকুন', stayUpdatedText: 'গুরুত্বপূর্ণ সরকারি তথ্য ও deadline alert পান।',
    latestTicker: 'সর্বশেষ আপডেট', demoVersion: 'ডেমো সংস্করণ', copyEmail: 'ইমেইল কপি করুন', copied: 'কপি হয়েছে', officialLinks: 'অফিসিয়াল লিঙ্ক ও সূত্র'
  },
  hi: {
    ...shared,
    home: 'होम', latestNav: 'नवीनतम अपडेट', articles: 'अपडेट', categories: 'श्रेणियाँ', about: 'हमारे बारे में',
    services: 'सेवाएँ', community: 'समुदाय', contact: 'संपर्क', search: 'खोजें', close: 'बंद करें', menu: 'मेनू',
    searchPlaceholder: 'नौकरियाँ, योजनाएँ, एडमिट कार्ड, परिणाम खोजें…', searchHint: 'सत्यापित सार्वजनिक जानकारी खोजें।', noResults: 'कोई मिलती-जुलती जानकारी नहीं मिली।',
    independent: 'स्वतंत्र सूचना मंच', heroTitle: 'सत्यापित सरकारी नौकरियाँ, योजनाएँ और परीक्षा अपडेट',
    heroDescription: 'पश्चिम बंगाल और पूरे भारत की आधिकारिक-स्रोत जानकारी, English, বাংলা और हिन्दी में स्पष्ट रूप से समझाई गई।',
    explore: 'नवीनतम अपडेट देखें', joinTelegram: 'Telegram से जुड़ें', joinWhatsApp: 'WhatsApp अपडेट', verifiedSources: 'आधिकारिक स्रोत',
    threeLanguages: 'तीन भाषाएँ', freeAccess: 'निःशुल्क पहुँच', regularlyUpdated: 'नियमित अपडेट', latest: 'नवीनतम अपडेट',
    latestDescription: 'सत्यापन स्थिति, तारीखों और आधिकारिक स्रोतों के साथ स्पष्ट सारांश।', viewAll: 'सभी अपडेट देखें', whatWeCover: 'श्रेणी के अनुसार देखें',
    howItWorks: 'हम जानकारी कैसे सत्यापित करते हैं', stepDiscover: 'आधिकारिक स्रोत', stepVerify: 'तथ्य जाँच', stepExplain: 'स्पष्ट व्याख्या', stepUpdate: 'अपडेट ट्रैकिंग',
    communityTitle: 'अपने पसंदीदा प्लेटफ़ॉर्म पर अपडेट पाएँ', disclaimerShort: 'स्वतंत्र सूचना मंच। किसी सरकारी विभाग से संबद्ध नहीं।',
    updated: 'अपडेट', published: 'प्रकाशित', lastVerified: 'अंतिम सत्यापन', source: 'आधिकारिक स्रोत', apply: 'आधिकारिक वेबसाइट', readMore: 'विवरण देखें',
    articleCount: 'अपडेट', noArticles: 'यहाँ अभी कोई अपडेट प्रकाशित नहीं है।', allCategories: 'सभी श्रेणियाँ', backToUpdates: 'अपडेट पर वापस जाएँ', verification: 'सत्यापन स्थिति',
    closed: 'बंद', disclaimer: 'अस्वीकरण', deadlines: 'आगामी अंतिम तिथियाँ', saved: 'सहेजे गए लेख', recent: 'हाल में देखे गए', save: 'बाद के लिए सहेजें', savedLabel: 'सहेजा गया', share: 'साझा करें',
    popularServices: 'लोकप्रिय योजनाएँ और सेवाएँ', stayUpdated: 'अपडेट पाते रहें', stayUpdatedText: 'महत्वपूर्ण सरकारी जानकारी और अंतिम तिथि अलर्ट पाएँ।',
    latestTicker: 'नवीनतम अपडेट', demoVersion: 'डेमो संस्करण', copyEmail: 'ईमेल कॉपी करें', copied: 'कॉपी हो गया', officialLinks: 'आधिकारिक लिंक और स्रोत'
  }
} as const;

export function ui(locale: Locale) { return UI[locale]; }

export function localizedPath(locale: Locale, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${BASE_PATH}${locale}/${clean}${clean ? '/' : ''}`;
}

export function replaceLocale(pathname: string, locale: Locale) {
  const path = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname.replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments[0] = locale; else segments.unshift(locale);
  return `${BASE_PATH}${segments.join('/')}/`;
}

export function dateLocale(locale: Locale) { return localeMeta[locale].intl; }

export const verificationLabels = {
  en: { 'officially-confirmed': 'Officially Confirmed', 'under-verification': 'Under Verification', corrected: 'Corrected', withdrawn: 'Withdrawn', closed: 'Closed' },
  bn: { 'officially-confirmed': 'অফিসিয়ালভাবে নিশ্চিত', 'under-verification': 'যাচাই চলছে', corrected: 'সংশোধিত', withdrawn: 'প্রত্যাহার', closed: 'বন্ধ' },
  hi: { 'officially-confirmed': 'आधिकारिक रूप से पुष्टि', 'under-verification': 'सत्यापन जारी', corrected: 'सुधारा गया', withdrawn: 'वापस लिया गया', closed: 'बंद' }
} as const;
