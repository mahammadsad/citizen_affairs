export function normalizeSourceUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return trimmed;
  }
}

export function deduplicateSourceRecords<T extends { url: string }>(
  sources: T[],
  sourceUrls: string[],
  officialNoticeUrl?: string
) {
  const seen = new Set<string>();
  const officialKey = officialNoticeUrl ? normalizeSourceUrl(officialNoticeUrl) : '';

  const uniqueSources = sources.filter((source) => {
    const key = normalizeSourceUrl(source.url);
    if (!key || key === officialKey || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const uniqueSourceUrls = sourceUrls.filter((url) => {
    const key = normalizeSourceUrl(url);
    if (!key || key === officialKey || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { sources: uniqueSources, sourceUrls: uniqueSourceUrls };
}
