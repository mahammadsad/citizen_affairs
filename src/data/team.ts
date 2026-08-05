import type { Locale } from '../i18n';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  order: number;
  role: Record<Locale, string>;
  bio: Record<Locale, string>;
}

/**
 * Public organization profiles live here, separately from article authors.
 * Add future members as new entries with their organizational role.
 */
export const teamMembers: TeamMember[] = [
  {
    id: 'mahammad-sad',
    name: 'Mahammad Sad',
    initials: 'MS',
    order: 1,
    role: {
      en: 'Founder',
      bn: 'প্রতিষ্ঠাতা',
      hi: 'संस्थापक',
    },
    bio: {
      en: 'Founder of Citizen Affairs. He created the platform and leads its product direction, publishing systems and long-term development.',
      bn: 'Citizen Affairs-এর প্রতিষ্ঠাতা। তিনি প্ল্যাটফর্মটি তৈরি করেছেন এবং এর পণ্য-দিশা, প্রকাশনা ব্যবস্থা ও দীর্ঘমেয়াদি উন্নয়নের নেতৃত্ব দেন।',
      hi: 'Citizen Affairs के संस्थापक। उन्होंने इस प्लेटफ़ॉर्म की स्थापना की और इसकी उत्पाद दिशा, प्रकाशन प्रणाली तथा दीर्घकालिक विकास का नेतृत्व करते हैं।',
    },
  },
];
