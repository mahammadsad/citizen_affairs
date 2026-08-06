export interface EditorialSourceRecord {
  title?: string;
  url: string;
  publishingAuthority?: string;
  designation?: 'primary' | 'secondary';
  documentNumber?: string;
  publicationDate?: Date;
  accessedDate?: Date;
  notes?: string;
}

interface SourceRecordInput {
  sources?: EditorialSourceRecord[];
  sourceUrls?: string[];
  officialNoticeUrl?: string;
}

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

export function mergeSourceRecords({
  sources = [],
  sourceUrls = [],
  officialNoticeUrl
}: SourceRecordInput): EditorialSourceRecord[] {
  const records: EditorialSourceRecord[] = [];
  const seen = new Set<string>();

  const add = (record: EditorialSourceRecord) => {
    const normalized = normalizeSourceUrl(record.url);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    records.push(record);
  };

  sources.forEach(add);
  sourceUrls.forEach((url) => add({ url }));
  if (officialNoticeUrl) add({ url: officialNoticeUrl });

  return records;
}
