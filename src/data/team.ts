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
    id: 'citizen-affairs-editorial-desk',
    name: 'Citizen Affairs Editorial Desk',
    initials: 'CA',
    order: 1,
    role: {
      en: 'Publication desk',
      bn: 'প্রকাশনা ডেস্ক',
      hi: 'प्रकाशन डेस्क',
    },
    bio: {
      en: 'Responsible for source checks, clear-language publishing, update tracking and maintaining the corrections process.',
      bn: 'সূত্র যাচাই, সহজ ভাষায় প্রকাশনা, আপডেট অনুসরণ এবং সংশোধন প্রক্রিয়া রক্ষণাবেক্ষণের দায়িত্বে।',
      hi: 'स्रोत जाँच, सरल भाषा में प्रकाशन, अपडेट ट्रैकिंग और सुधार प्रक्रिया बनाए रखने के लिए जिम्मेदार।',
    },
  },
];
