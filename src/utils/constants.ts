/**
 * Application Constants
 */

export const SITE = {
  name: 'সরকারি তথ্যকেন্দ্র',
  nameEn: 'Sarkari Tathya Kendra',
  tagline: 'সঠিক তথ্য, সবার জন্য।',
  taglineEn: 'Verified information for everyone.',
  description:
    'পশ্চিমবঙ্গ ও ভারতের সরকারি চাকরি, সরকারি প্রকল্প, পরীক্ষা ও নোটিশের তথ্য সহজ বাংলায় প্রদানকারী একটি স্বাধীন কমিউনিটি প্ল্যাটফর্ম।',
  url: 'https://mahammadsad.github.io/sarkari-tathya-kendra',
  basePath: '/sarkari-tathya-kendra/',
  logo: '/sarkari-tathya-kendra/assets/logo-mark.svg',
  ogImage: '/sarkari-tathya-kendra/assets/og-image.jpg',
  author: {
    name: 'Mahammad Sad',
    role: 'Programmer and Mathematician',
    bio: 'Interested in AI automation, technology, business, startups, investing and computer science.',
    email: 'contact.mahammadsad@gmail.com',
    github: 'https://github.com/mahammadsad',
  },
};

export const ADS = {
  enabled: false,
  publisherId: '',
};

export const SOCIALS = {
  telegram: 'https://t.me/SarkariTathyaKendra',
  telegramMCQ: 'https://t.me/BongCompetitiveExam',
  whatsapp: 'https://whatsapp.com/channel/0029Vb8NQAX9cDDTfaEDwk3r',
  email: 'contact.mahammadsad@gmail.com',
};

export const COLORS = {
  primary: '#0A4D8C',
  navy: '#08315C',
  green: '#138A36',
  greenText: '#10742D',
  orange: '#F39C12',
  white: '#FFFFFF',
  light: '#F5F7FA',
  text: '#17202E',
  textMuted: '#5B6472',
  border: '#E3E8EF',
  surface: '#FFFFFF',
  bg: '#F5F7FA',
  surfaceAlt: '#EEF2F7',
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 860,
  desktop: 1100,
};

export const FONTS = {
  display: '"Noto Serif Bengali", "Hind Siliguri", serif',
  body: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
};

export const SERVICES = [
  { id: 'jobs', icon: 'briefcase', title: 'সরকারি চাকরি' },
  { id: 'projects', icon: 'bank', title: 'সরকারি প্রকল্প' },
  { id: 'exams', icon: 'calendar', title: 'পরীক্ষার আপডেট' },
  { id: 'admit', icon: 'id-card', title: 'অ্যাডমিট কার্ড' },
  { id: 'results', icon: 'bar-chart', title: 'রেজাল্ট' },
  { id: 'notices', icon: 'megaphone', title: 'সরকারি নোটিশ' },
  { id: 'mcq', icon: 'check-square', title: 'MCQ Practice' },
  { id: 'materials', icon: 'book-open', title: 'Study Materials' },
  { id: 'affairs', icon: 'globe', title: 'Current Affairs' },
  { id: 'notes', icon: 'file-text', title: 'PDF Notes' },
];

export const CATEGORIES_DEFAULT = [
  { id: 'jobs', name: 'সরকারি চাকরি', color: 'primary' },
  { id: 'projects', name: 'সরকারি প্রকল্প', color: 'orange' },
  { id: 'exams', name: 'পরীক্ষার প্রস্তুতি', color: 'green' },
  { id: 'notices', name: 'নোটিশ', color: 'navy' },
  { id: 'affairs', name: 'কারেন্ট অ্যাফেয়ার্স', color: 'primary' },
  { id: 'materials', name: 'স্টাডি মেটেরিয়াল', color: 'green' },
];
