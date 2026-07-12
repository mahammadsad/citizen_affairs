/**
 * Client-side Search Index & Filtering
 */

export interface SearchItem {
  label: string;
  sub?: string;
  href: string;
  keywords?: string[];
}

export function buildSearchIndex(items: SearchItem[]): SearchItem[] {
  return items.map((item) => ({
    ...item,
    keywords: [
      item.label.toLowerCase(),
      ...(item.sub ? [item.sub.toLowerCase()] : []),
      ...(item.keywords ? item.keywords.map((k) => k.toLowerCase()) : []),
    ],
  }));
}

export function searchItems(query: string, items: SearchItem[]): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return items.filter((item) => {
    const keywords = [
      item.label.toLowerCase(),
      ...(item.sub ? [item.sub.toLowerCase()] : []),
      ...(item.keywords ? item.keywords : []),
    ];

    return keywords.some((keyword) => keyword.includes(q));
  });
}

