import { BASE_PATH } from '@utils/constants';

export const locales = ['en', 'bn', 'hi'] as const;
export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { name: string; nativeName: string; code: string; intl: string }> = {
  en: { name: 'English', nativeName: 'English', code: 'EN', intl: 'en-IN' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', code: 'BN', intl: 'bn-IN' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', code: 'HI', intl: 'hi-IN' }
};

export const isLocale = (value: string | undefined): value is Locale => locales.includes(value as Locale);

export const UI = {
  en: {
    home: 'Home', latestNav: 'Latest Updates', articles: 'Updates', categories: 'Categories', about: 'About', governmentJobs: 'Government Jobs', welfareSchemes: 'Welfare Schemes', verificationMethod: 'Verification',
    services: 'Services', community: 'Community', contact: 'Contact', search: 'Search', close: 'Close', menu: 'Menu',
    privacy: 'Privacy Policy', terms: 'Terms', editorial: 'Editorial Policy', disclaimer: 'Disclaimer', corrections: 'Corrections Policy', authorProfile: 'Author',
    searchPlaceholder: 'Search jobs, schemes, admit cards, results…', searchHint: 'Search verified public information.', noResults: 'No matching information found.',
    popularSearches: 'Popular searches', recentSearches: 'Recent searches',
    popularSearchTerms: ['SSC', 'Railway', 'Scholarships', 'Ayushman Bharat', 'All India Jobs', 'Admit Cards', 'Results'],
    independent: 'Independent information platform', heroTitle: 'Verified Government Jobs and Welfare Schemes',
    heroDescription: 'Officially sourced government job notices and welfare schemes, clearly explained for citizens across India.',
    nationwide: 'Government updates from across India', centralAndState: 'Central and State Government information',
    explore: 'Explore Latest Updates', joinTelegram: 'Join Telegram', joinWhatsApp: 'WhatsApp Updates', verifiedSources: 'Official sources',
    threeLanguages: 'Three languages', freeAccess: 'Free access', regularlyUpdated: 'Regularly updated', latest: 'Latest Updates',
    latestDescription: 'Clear summaries with verification status, dates and official sources.', viewAll: 'View all updates', whatWeCover: 'Browse by category',
    categoriesDescription: 'Browse jobs, schemes, education, exams, notices and public services by topic.',
    howItWorks: 'How we verify information', stepDiscover: 'Official source', stepVerify: 'Fact check', stepExplain: 'Clear explanation', stepUpdate: 'Update tracking',
    communityTitle: 'Stay updated where you already are', disclaimerShort: 'Independent information platform. Not affiliated with any government department.',
    updated: 'Updated', published: 'Published', lastVerified: 'Last verified', source: 'Official source', apply: 'Official Website', readMore: 'View Details', writtenBy: 'Written by', editedBy: 'Edited by', factCheckedBy: 'Fact-checked by', reviewedBy: 'Reviewed by', publishedBy: 'Published by',
    noArticles: 'No published updates here yet.', allCategories: 'All categories', backToUpdates: 'Back to updates', verification: 'Verification status',
    closed: 'Closed', deadlines: 'Upcoming Deadlines', saved: 'Saved articles', recent: 'Recently viewed', save: 'Save for later', savedLabel: 'Saved', share: 'Share',
    popularServices: 'Popular schemes and services', stayUpdated: 'Stay updated', stayUpdatedText: 'Receive important government information and deadline alerts.',
    latestTicker: 'Latest Updates', tickerEmpty: 'No verified updates have been published yet.', copyEmail: 'Copy email', copied: 'Copied', officialLinks: 'Official links and sources',
    primaryNav: 'Primary navigation', mobileNav: 'Mobile navigation', quickLinks: 'Quick links', language: 'Language', closeMenu: 'Close menu', changeTheme: 'Change theme', skipToContent: 'Skip to main content', logo: 'logo',
    filtersAndSorting: 'Filters & sorting', allIndia: 'All India', centralGovernment: 'Central Government', stateGovernments: 'State Governments', allStates: 'All States',
    governmentLevel: 'Government coverage', state: 'State or Union Territory', category: 'Category', deadlineStatus: 'Deadline status', allStatuses: 'All statuses', verificationStatus: 'Verification status', sort: 'Sort updates',
    open: 'Open', closingSoon: 'Closing Soon', urgent: '3 days or fewer', confirmed: 'Confirmed', underVerification: 'Under Verification', nearestDeadline: 'Nearest Deadline',
    updateCount: '{count} updates', featured: 'Featured',
    featuredEmptyTitle: 'No featured update is available right now', featuredEmptyBody: 'Browse the latest verified information or check back soon.',
    latestEmpty: 'No updates have been published yet.', deadlinesEmpty: 'There are no upcoming deadlines right now.', noSaved: 'You have not saved any articles yet.', noRecent: 'No recently viewed articles yet.',
    contactUs: 'Contact us', exploreFooter: 'Explore', trustPolicies: 'Trust & Policies', telegramUpdates: 'Telegram Updates', whatsappUpdates: 'WhatsApp Updates', mcqGroup: 'MCQ Group', advertisement: 'Advertisement',
    fastUpdateAlerts: 'Fast update alerts', channelUpdates: 'Channel updates', practiceCommunity: 'Practice community', independentService: 'Independent information service', notGovernmentWebsite: 'Not a government website', backToTop: 'Back to top',
    savedDescription: 'Articles saved on this device. No login required.', deadlinesDescription: 'Nearest valid deadlines appear first. Closed items remain clearly marked.',
    deadline: 'Deadline', copyLink: 'Copy link', breadcrumb: 'Breadcrumb', checkOriginal: 'Check the original government document before making a decision.', sourceItem: 'Source',
    quickSummary: 'Quick summary', importantDates: 'Important dates', eligibility: 'Eligibility', amount: 'Benefits, vacancies or amount', requiredDocuments: 'Required documents', updateHistory: 'Update history', relatedArticles: 'Related articles', faq: 'Frequently asked questions', primarySource: 'Primary source: Official notification or portal',
    policyUpdated: 'Last updated: July 2026', publishingCorrections: 'Publishing and corrections', publishingCorrectionsText: 'Dates, amounts, vacancies and eligibility are checked against original government documents. Corrections and deadline changes are recorded in the article update history.', learnMoreAbout: 'Read more about us', reportCorrection: 'Report a correction'
  },
  bn: {
    home: 'হোম', latestNav: 'সর্বশেষ আপডেট', articles: 'আপডেট', categories: 'বিভাগ', about: 'আমাদের সম্পর্কে', governmentJobs: 'সরকারি চাকরি', welfareSchemes: 'জনকল্যাণ প্রকল্প', verificationMethod: 'তথ্য যাচাই',
    services: 'পরিষেবা', community: 'কমিউনিটি', contact: 'যোগাযোগ', search: 'খুঁজুন', close: 'বন্ধ করুন', menu: 'মেনু',
    privacy: 'গোপনীয়তা নীতি', terms: 'শর্তাবলি', editorial: 'সম্পাদকীয় নীতি', disclaimer: 'দায়ত্যাগ', corrections: 'সংশোধন নীতি', authorProfile: 'লেখক',
    searchPlaceholder: 'চাকরি, প্রকল্প, অ্যাডমিট কার্ড, ফলাফল খুঁজুন…', searchHint: 'যাচাইকৃত জনতথ্য খুঁজুন।', noResults: 'মিলছে এমন তথ্য পাওয়া যায়নি।',
    popularSearches: 'জনপ্রিয় অনুসন্ধান', recentSearches: 'সাম্প্রতিক অনুসন্ধান',
    popularSearchTerms: ['SSC', 'রেলওয়ে', 'স্কলারশিপ', 'Ayushman Bharat', 'সারা ভারতের চাকরি', 'অ্যাডমিট কার্ড', 'ফলাফল'],
    independent: 'স্বাধীন তথ্য প্ল্যাটফর্ম', heroTitle: 'যাচাইকৃত সরকারি চাকরি ও জনকল্যাণ প্রকল্প',
    heroDescription: 'সারা ভারতের সরকারি চাকরির বিজ্ঞপ্তি ও জনকল্যাণ প্রকল্পের অফিসিয়াল সূত্রভিত্তিক সহজ ব্যাখ্যা।',
    nationwide: 'সারা ভারতের সরকারি আপডেট', centralAndState: 'কেন্দ্রীয় ও রাজ্য সরকারের গুরুত্বপূর্ণ তথ্য',
    explore: 'সর্বশেষ আপডেট দেখুন', joinTelegram: 'Telegram-এ যুক্ত হন', joinWhatsApp: 'WhatsApp আপডেট', verifiedSources: 'অফিসিয়াল সূত্র',
    threeLanguages: 'তিনটি ভাষা', freeAccess: 'বিনামূল্যে', regularlyUpdated: 'নিয়মিত আপডেট', latest: 'সর্বশেষ আপডেট',
    latestDescription: 'যাচাইয়ের অবস্থা, গুরুত্বপূর্ণ তারিখ ও অফিসিয়াল সূত্রসহ সহজ সারাংশ।', viewAll: 'সব আপডেট দেখুন', whatWeCover: 'বিভাগ অনুযায়ী দেখুন',
    categoriesDescription: 'চাকরি, প্রকল্প, শিক্ষা, পরীক্ষা, নোটিশ ও জনপরিষেবার তথ্য বিষয় অনুযায়ী দেখুন।',
    howItWorks: 'যেভাবে তথ্য যাচাই করি', stepDiscover: 'অফিসিয়াল সূত্র', stepVerify: 'তথ্য যাচাই', stepExplain: 'সহজ ব্যাখ্যা', stepUpdate: 'আপডেট অনুসরণ',
    communityTitle: 'আপনার পরিচিত প্ল্যাটফর্মেই আপডেট পান', disclaimerShort: 'স্বাধীন তথ্য প্ল্যাটফর্ম। কোনো সরকারি দপ্তরের সঙ্গে যুক্ত নয়।',
    updated: 'আপডেট হয়েছে', published: 'প্রকাশিত', lastVerified: 'সর্বশেষ যাচাই', source: 'অফিসিয়াল সূত্র', apply: 'অফিসিয়াল ওয়েবসাইট', readMore: 'বিস্তারিত দেখুন', writtenBy: 'লিখেছেন', editedBy: 'সম্পাদনা', factCheckedBy: 'তথ্য যাচাই', reviewedBy: 'পর্যালোচনা', publishedBy: 'প্রকাশ করেছেন',
    noArticles: 'এখানে এখনও কোনো আপডেট প্রকাশিত হয়নি।', allCategories: 'সব বিভাগ', backToUpdates: 'আপডেটে ফিরে যান', verification: 'যাচাইয়ের অবস্থা',
    closed: 'বন্ধ', deadlines: 'আসন্ন সময়সীমা', saved: 'সংরক্ষিত নিবন্ধ', recent: 'সম্প্রতি দেখা', save: 'পরে পড়ার জন্য রাখুন', savedLabel: 'সংরক্ষিত', share: 'শেয়ার করুন',
    popularServices: 'জনপ্রিয় প্রকল্প ও পরিষেবা', stayUpdated: 'আপডেট পেতে সঙ্গে থাকুন', stayUpdatedText: 'গুরুত্বপূর্ণ সরকারি তথ্য ও সময়সীমার সতর্কতা পান।',
    latestTicker: 'সর্বশেষ আপডেট', tickerEmpty: 'এখনও কোনো যাচাইকৃত আপডেট প্রকাশিত হয়নি।', copyEmail: 'ইমেইল কপি করুন', copied: 'কপি হয়েছে', officialLinks: 'অফিসিয়াল লিঙ্ক ও সূত্র',
    primaryNav: 'প্রধান নেভিগেশন', mobileNav: 'মোবাইল নেভিগেশন', quickLinks: 'দ্রুত লিঙ্ক', language: 'ভাষা', closeMenu: 'মেনু বন্ধ করুন', changeTheme: 'থিম পরিবর্তন করুন', skipToContent: 'মূল বিষয়বস্তুতে যান', logo: 'লোগো',
    filtersAndSorting: 'ফিল্টার ও সাজানো', allIndia: 'সারা ভারত', centralGovernment: 'কেন্দ্রীয় সরকার', stateGovernments: 'রাজ্য সরকারসমূহ', allStates: 'সব রাজ্য',
    governmentLevel: 'সরকারি ক্ষেত্র', state: 'রাজ্য বা কেন্দ্রশাসিত অঞ্চল', category: 'বিভাগ', deadlineStatus: 'সময়সীমার অবস্থা', allStatuses: 'সব অবস্থা', verificationStatus: 'যাচাইয়ের অবস্থা', sort: 'আপডেট সাজান',
    open: 'চলমান', closingSoon: 'শীঘ্রই বন্ধ', urgent: '৩ দিন বা কম', confirmed: 'নিশ্চিত', underVerification: 'যাচাই চলছে', nearestDeadline: 'নিকটতম সময়সীমা',
    updateCount: '{count}টি আপডেট', featured: 'বিশেষ আপডেট',
    featuredEmptyTitle: 'এই মুহূর্তে কোনো বিশেষ আপডেট নেই', featuredEmptyBody: 'সর্বশেষ যাচাইকৃত তথ্য দেখুন অথবা পরে আবার আসুন।',
    latestEmpty: 'এখনও কোনো আপডেট প্রকাশিত হয়নি।', deadlinesEmpty: 'এই মুহূর্তে কোনো আসন্ন সময়সীমা নেই।', noSaved: 'আপনি এখনও কোনো নিবন্ধ সংরক্ষণ করেননি।', noRecent: 'সম্প্রতি দেখা কোনো নিবন্ধ নেই।',
    contactUs: 'যোগাযোগ করুন', exploreFooter: 'দেখুন', trustPolicies: 'বিশ্বাস ও নীতি', telegramUpdates: 'Telegram আপডেট', whatsappUpdates: 'WhatsApp আপডেট', mcqGroup: 'MCQ গ্রুপ', advertisement: 'বিজ্ঞাপন',
    fastUpdateAlerts: 'দ্রুত আপডেটের সতর্কতা', channelUpdates: 'চ্যানেলের আপডেট', practiceCommunity: 'অনুশীলন কমিউনিটি', independentService: 'স্বাধীন তথ্যসেবা', notGovernmentWebsite: 'সরকারি ওয়েবসাইট নয়', backToTop: 'উপরে যান',
    savedDescription: 'এই ডিভাইসে সংরক্ষিত নিবন্ধ। লগইনের প্রয়োজন নেই।', deadlinesDescription: 'নিকটতম বৈধ সময়সীমা আগে দেখানো হয়েছে। বন্ধ হয়ে যাওয়া তথ্য স্পষ্টভাবে চিহ্নিত।',
    deadline: 'শেষ তারিখ', copyLink: 'লিঙ্ক কপি করুন', breadcrumb: 'পৃষ্ঠার পথ', checkOriginal: 'কোনো সিদ্ধান্ত নেওয়ার আগে মূল সরকারি নথি যাচাই করুন।', sourceItem: 'সূত্র',
    quickSummary: 'সংক্ষিপ্ত সারাংশ', importantDates: 'গুরুত্বপূর্ণ তারিখ', eligibility: 'যোগ্যতা', amount: 'সুবিধা, শূন্যপদ বা অর্থের পরিমাণ', requiredDocuments: 'প্রয়োজনীয় নথি', updateHistory: 'আপডেটের ইতিহাস', relatedArticles: 'সম্পর্কিত নিবন্ধ', faq: 'সাধারণ প্রশ্ন', primarySource: 'প্রাথমিক সূত্র: অফিসিয়াল বিজ্ঞপ্তি বা পোর্টাল',
    policyUpdated: 'সর্বশেষ আপডেট: জুলাই ২০২৬', publishingCorrections: 'প্রকাশ ও সংশোধন', publishingCorrectionsText: 'তারিখ, অর্থের পরিমাণ, শূন্যপদ ও যোগ্যতা মূল সরকারি নথির সঙ্গে মিলিয়ে দেখা হয়। সংশোধনী বা সময়সীমা পরিবর্তিত হলে নিবন্ধের আপডেট ইতিহাসে তা যোগ করা হয়।', learnMoreAbout: 'আমাদের সম্পর্কে বিস্তারিত পড়ুন', reportCorrection: 'সংশোধনের অনুরোধ পাঠান'
  },
  hi: {
    home: 'होम', latestNav: 'नवीनतम अपडेट', articles: 'अपडेट', categories: 'श्रेणियाँ', about: 'हमारे बारे में', governmentJobs: 'सरकारी नौकरियाँ', welfareSchemes: 'कल्याणकारी योजनाएँ', verificationMethod: 'सत्यापन',
    services: 'सेवाएँ', community: 'समुदाय', contact: 'संपर्क', search: 'खोजें', close: 'बंद करें', menu: 'मेनू',
    privacy: 'गोपनीयता नीति', terms: 'नियम और शर्तें', editorial: 'संपादकीय नीति', disclaimer: 'अस्वीकरण', corrections: 'सुधार नीति', authorProfile: 'लेखक',
    searchPlaceholder: 'नौकरियाँ, योजनाएँ, एडमिट कार्ड, परिणाम खोजें…', searchHint: 'सत्यापित सार्वजनिक जानकारी खोजें।', noResults: 'कोई मिलती-जुलती जानकारी नहीं मिली।',
    popularSearches: 'लोकप्रिय खोजें', recentSearches: 'हाल की खोजें',
    popularSearchTerms: ['SSC', 'रेलवे', 'छात्रवृत्तियाँ', 'Ayushman Bharat', 'पूरे भारत की नौकरियाँ', 'एडमिट कार्ड', 'परिणाम'],
    independent: 'स्वतंत्र सूचना मंच', heroTitle: 'सत्यापित सरकारी नौकरियाँ और कल्याणकारी योजनाएँ',
    heroDescription: 'पूरे भारत की सरकारी नौकरी सूचनाएँ और कल्याणकारी योजनाएँ, आधिकारिक स्रोतों के साथ सरल भाषा में।',
    nationwide: 'पूरे भारत से सरकारी अपडेट', centralAndState: 'केंद्र और राज्य सरकारों की महत्वपूर्ण जानकारी',
    explore: 'नवीनतम अपडेट देखें', joinTelegram: 'Telegram से जुड़ें', joinWhatsApp: 'WhatsApp अपडेट', verifiedSources: 'आधिकारिक स्रोत',
    threeLanguages: 'तीन भाषाएँ', freeAccess: 'निःशुल्क पहुँच', regularlyUpdated: 'नियमित अपडेट', latest: 'नवीनतम अपडेट',
    latestDescription: 'सत्यापन स्थिति, तारीखों और आधिकारिक स्रोतों के साथ स्पष्ट सारांश।', viewAll: 'सभी अपडेट देखें', whatWeCover: 'श्रेणी के अनुसार देखें',
    categoriesDescription: 'नौकरियाँ, योजनाएँ, शिक्षा, परीक्षाएँ, सूचनाएँ और सार्वजनिक सेवाएँ विषय के अनुसार देखें।',
    howItWorks: 'हम जानकारी कैसे सत्यापित करते हैं', stepDiscover: 'आधिकारिक स्रोत', stepVerify: 'तथ्य जाँच', stepExplain: 'स्पष्ट व्याख्या', stepUpdate: 'अपडेट की निगरानी',
    communityTitle: 'अपने पसंदीदा प्लेटफ़ॉर्म पर अपडेट पाएँ', disclaimerShort: 'स्वतंत्र सूचना मंच। किसी सरकारी विभाग से संबद्ध नहीं।',
    updated: 'अपडेट किया गया', published: 'प्रकाशित', lastVerified: 'अंतिम सत्यापन', source: 'आधिकारिक स्रोत', apply: 'आधिकारिक वेबसाइट', readMore: 'विवरण देखें', writtenBy: 'लेखक', editedBy: 'संपादक', factCheckedBy: 'तथ्य-जाँच', reviewedBy: 'समीक्षक', publishedBy: 'प्रकाशक',
    noArticles: 'यहाँ अभी तक कोई अपडेट प्रकाशित नहीं हुआ है।', allCategories: 'सभी श्रेणियाँ', backToUpdates: 'अपडेट पर वापस जाएँ', verification: 'सत्यापन स्थिति',
    closed: 'बंद', deadlines: 'आगामी अंतिम तिथियाँ', saved: 'सहेजे गए लेख', recent: 'हाल में देखे गए', save: 'बाद के लिए सहेजें', savedLabel: 'सहेजा गया', share: 'साझा करें',
    popularServices: 'लोकप्रिय योजनाएँ और सेवाएँ', stayUpdated: 'अपडेट पाते रहें', stayUpdatedText: 'महत्वपूर्ण सरकारी जानकारी और अंतिम तिथि अलर्ट पाएँ।',
    latestTicker: 'नवीनतम अपडेट', tickerEmpty: 'अभी तक कोई सत्यापित अपडेट प्रकाशित नहीं हुआ है।', copyEmail: 'ईमेल कॉपी करें', copied: 'कॉपी हो गया', officialLinks: 'आधिकारिक लिंक और स्रोत',
    primaryNav: 'मुख्य नेविगेशन', mobileNav: 'मोबाइल नेविगेशन', quickLinks: 'त्वरित लिंक', language: 'भाषा', closeMenu: 'मेनू बंद करें', changeTheme: 'थीम बदलें', skipToContent: 'मुख्य सामग्री पर जाएँ', logo: 'लोगो',
    filtersAndSorting: 'फ़िल्टर और क्रमबद्ध करें', allIndia: 'संपूर्ण भारत', centralGovernment: 'केंद्र सरकार', stateGovernments: 'राज्य सरकारें', allStates: 'सभी राज्य',
    governmentLevel: 'सरकारी क्षेत्र', state: 'राज्य या केंद्र शासित प्रदेश', category: 'श्रेणी', deadlineStatus: 'अंतिम तिथि की स्थिति', allStatuses: 'सभी स्थितियाँ', verificationStatus: 'सत्यापन स्थिति', sort: 'अपडेट क्रमबद्ध करें',
    open: 'खुला', closingSoon: 'जल्द बंद', urgent: '3 दिन या कम', confirmed: 'पुष्टि की गई', underVerification: 'सत्यापन जारी', nearestDeadline: 'निकटतम अंतिम तिथि',
    updateCount: '{count} अपडेट', featured: 'विशेष अपडेट',
    featuredEmptyTitle: 'अभी कोई विशेष अपडेट उपलब्ध नहीं है', featuredEmptyBody: 'नवीनतम सत्यापित जानकारी देखें या कुछ समय बाद फिर आएँ।',
    latestEmpty: 'अभी तक कोई अपडेट प्रकाशित नहीं हुआ है।', deadlinesEmpty: 'अभी कोई आगामी अंतिम तिथि नहीं है।', noSaved: 'आपने अभी तक कोई लेख सहेजा नहीं है।', noRecent: 'हाल में देखा गया कोई लेख नहीं है।',
    contactUs: 'संपर्क करें', exploreFooter: 'देखें', trustPolicies: 'विश्वास और नीतियाँ', telegramUpdates: 'Telegram अपडेट', whatsappUpdates: 'WhatsApp अपडेट', mcqGroup: 'MCQ समूह', advertisement: 'विज्ञापन',
    fastUpdateAlerts: 'त्वरित अपडेट अलर्ट', channelUpdates: 'चैनल अपडेट', practiceCommunity: 'अभ्यास समुदाय', independentService: 'स्वतंत्र सूचना सेवा', notGovernmentWebsite: 'सरकारी वेबसाइट नहीं', backToTop: 'ऊपर जाएँ',
    savedDescription: 'इस डिवाइस पर सहेजे गए लेख। लॉगिन आवश्यक नहीं है।', deadlinesDescription: 'निकटतम वैध अंतिम तिथियाँ पहले दिखाई गई हैं। बंद मदें स्पष्ट रूप से चिह्नित हैं।',
    deadline: 'अंतिम तिथि', copyLink: 'लिंक कॉपी करें', breadcrumb: 'पृष्ठ क्रम', checkOriginal: 'निर्णय लेने से पहले मूल सरकारी दस्तावेज़ जाँचें।', sourceItem: 'स्रोत',
    quickSummary: 'त्वरित सारांश', importantDates: 'महत्वपूर्ण तिथियाँ', eligibility: 'पात्रता', amount: 'लाभ, रिक्तियाँ या राशि', requiredDocuments: 'आवश्यक दस्तावेज़', updateHistory: 'अपडेट इतिहास', relatedArticles: 'संबंधित लेख', faq: 'सामान्य प्रश्न', primarySource: 'प्राथमिक स्रोत: आधिकारिक सूचना या पोर्टल',
    policyUpdated: 'अंतिम अपडेट: जुलाई 2026', publishingCorrections: 'प्रकाशन और सुधार', publishingCorrectionsText: 'तारीख, राशि, रिक्ति और पात्रता मूल सरकारी दस्तावेज़ से मिलाई जाती है। सुधार या अंतिम तिथि बदलने पर लेख के अपडेट इतिहास में बदलाव दर्ज किया जाता है।', learnMoreAbout: 'हमारे बारे में विस्तार से पढ़ें', reportCorrection: 'सुधार की सूचना दें'
  }
} as const;

export function ui(locale: Locale) { return UI[locale]; }

export function localizedPath(locale: Locale, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (locale === 'en' && !clean) return BASE_PATH;
  return `${BASE_PATH}${locale}/${clean}${clean ? '/' : ''}`;
}

export type TrustPageId = 'about' | 'contact' | 'author' | 'corrections';

export function trustPagePath(locale: Locale, page: TrustPageId) {
  const segment = page === 'author' ? 'authors/mahammad-sad' : page;
  const prefix = locale === 'en' ? '' : `${locale}/`;
  return `${BASE_PATH}${prefix}${segment}/`;
}

export function replaceLocale(pathname: string, locale: Locale) {
  const path = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname.replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments[0] = locale; else segments.unshift(locale);
  return `${BASE_PATH}${segments.join('/')}/`;
}

export function dateLocale(locale: Locale) { return localeMeta[locale].intl; }

export function formatUpdateCount(locale: Locale, count: number) {
  const number = new Intl.NumberFormat(dateLocale(locale)).format(count);
  return ui(locale).updateCount.replace('{count}', number);
}

export const verificationLabels = {
  en: { 'officially-confirmed': 'Officially Confirmed', 'partially-confirmed': 'Partially Confirmed', 'under-verification': 'Under Verification', corrected: 'Corrected', withdrawn: 'Withdrawn', closed: 'Closed' },
  bn: { 'officially-confirmed': 'অফিসিয়ালভাবে নিশ্চিত', 'partially-confirmed': 'আংশিকভাবে নিশ্চিত', 'under-verification': 'যাচাই চলছে', corrected: 'সংশোধিত', withdrawn: 'প্রত্যাহার', closed: 'বন্ধ' },
  hi: { 'officially-confirmed': 'आधिकारिक रूप से पुष्टि', 'partially-confirmed': 'आंशिक रूप से पुष्टि', 'under-verification': 'सत्यापन जारी', corrected: 'सुधारा गया', withdrawn: 'वापस लिया गया', closed: 'बंद' }
} as const;
