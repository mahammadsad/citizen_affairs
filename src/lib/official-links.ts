import type { Locale } from '../i18n';

export type OfficialDomainKind = 'government' | 'public-institution' | 'listed-source' | 'invalid';
export type SourceFreshness = 'current' | 'review-soon' | 'stale' | 'unknown';

export interface OfficialLinkIdentity {
  hostname: string;
  kind: OfficialDomainKind;
  secure: boolean;
  valid: boolean;
}

export function officialLinkIdentity(value?: string): OfficialLinkIdentity {
  if (!value) return { hostname: '', kind: 'invalid', secure: false, valid: false };

  try {
    const parsed = new URL(value);
    const valid = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const government =
      hostname === 'gov.in' ||
      hostname.endsWith('.gov.in') ||
      hostname === 'nic.in' ||
      hostname.endsWith('.nic.in');
    const publicInstitution = hostname.endsWith('.ac.in') || hostname.endsWith('.edu.in');

    return {
      hostname,
      kind: !valid ? 'invalid' : government ? 'government' : publicInstitution ? 'public-institution' : 'listed-source',
      secure: parsed.protocol === 'https:',
      valid
    };
  } catch {
    return { hostname: '', kind: 'invalid', secure: false, valid: false };
  }
}

export function sourceFreshness(lastVerified?: Date, now = new Date()): SourceFreshness {
  if (!lastVerified || Number.isNaN(lastVerified.getTime())) return 'unknown';
  const ageDays = Math.max(0, Math.floor((now.getTime() - lastVerified.getTime()) / 86_400_000));
  if (ageDays <= 30) return 'current';
  if (ageDays <= 90) return 'review-soon';
  return 'stale';
}

export function officialLinkLabels(locale: Locale) {
  return {
    en: {
      government: 'Government domain',
      'public-institution': 'Public institution domain',
      'listed-source': 'Source listed by the editorial team',
      invalid: 'Destination unavailable',
      secure: 'Secure HTTPS connection',
      insecure: 'Connection is not HTTPS',
      current: 'Verified within 30 days',
      'review-soon': 'Last verified 31–90 days ago',
      stale: 'Verification is older than 90 days',
      unknown: 'Verification date unavailable',
      newTab: 'opens in a new tab'
    },
    bn: {
      government: 'সরকারি ডোমেইন',
      'public-institution': 'সরকারি/জনপ্রতিষ্ঠানের ডোমেইন',
      'listed-source': 'সম্পাদকীয় দল তালিকাভুক্ত সূত্র',
      invalid: 'গন্তব্য পাওয়া যায়নি',
      secure: 'নিরাপদ HTTPS সংযোগ',
      insecure: 'সংযোগটি HTTPS নয়',
      current: 'গত ৩০ দিনের মধ্যে যাচাই করা',
      'review-soon': '৩১–৯০ দিন আগে সর্বশেষ যাচাই',
      stale: 'যাচাই ৯০ দিনের বেশি পুরোনো',
      unknown: 'যাচাইয়ের তারিখ পাওয়া যায়নি',
      newTab: 'নতুন ট্যাবে খুলবে'
    },
    hi: {
      government: 'सरकारी डोमेन',
      'public-institution': 'सार्वजनिक संस्थान का डोमेन',
      'listed-source': 'संपादकीय टीम द्वारा सूचीबद्ध स्रोत',
      invalid: 'गंतव्य उपलब्ध नहीं',
      secure: 'सुरक्षित HTTPS कनेक्शन',
      insecure: 'कनेक्शन HTTPS नहीं है',
      current: 'पिछले 30 दिनों में सत्यापित',
      'review-soon': 'अंतिम सत्यापन 31–90 दिन पहले',
      stale: 'सत्यापन 90 दिनों से अधिक पुराना है',
      unknown: 'सत्यापन तिथि उपलब्ध नहीं',
      newTab: 'नए टैब में खुलेगा'
    }
  }[locale];
}
