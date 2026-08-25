export const shortLinks = Object.freeze([
  {
    slug: 'sbi',
    target: '/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — English',
  },
  {
    slug: 'sbi-bn',
    target: '/bn/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — Bengali',
  },
  {
    slug: 'sbi-hi',
    target: '/hi/articles/sbi-apprentice-result-2026/',
    label: 'SBI Apprentice Result 2026 — Hindi',
  },
  {
    slug: 'rrb',
    target: '/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — English',
  },
  {
    slug: 'rrb-bn',
    target: '/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — Bengali',
  },
  {
    slug: 'rrb-hi',
    target: '/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/',
    label: 'RRB NTPC UG CBT 1 Result 2026 — Hindi',
  },
]);

export function getShortLink(slug) {
  return shortLinks.find((entry) => entry.slug === slug) ?? null;
}
