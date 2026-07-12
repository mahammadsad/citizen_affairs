import type { Locale } from '../i18n';

export type DeadlineState = 'open' | 'closing-soon' | 'urgent' | 'closed' | 'none';

export function deadlineState(deadline?: Date, now = new Date()): DeadlineState {
  if (!deadline || Number.isNaN(deadline.getTime())) return 'none';
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), 23, 59, 59).getTime();
  const days = Math.ceil((end - today) / 86_400_000);
  if (days < 0) return 'closed';
  if (days <= 3) return 'urgent';
  if (days <= 15) return 'closing-soon';
  return 'open';
}

export function deadlineLabel(state: DeadlineState, locale: Locale) {
  const labels = {
    en: { open: 'Open', 'closing-soon': 'Closing Soon', urgent: 'Closing Soon', closed: 'Closed', none: '' },
    bn: { open: 'খোলা', 'closing-soon': 'শীঘ্রই বন্ধ', urgent: 'শীঘ্রই বন্ধ', closed: 'বন্ধ', none: '' },
    hi: { open: 'खुला', 'closing-soon': 'जल्द बंद', urgent: 'जल्द बंद', closed: 'बंद', none: '' }
  } as const;
  return labels[locale][state];
}
