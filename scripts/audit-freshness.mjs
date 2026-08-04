import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const DAY_MS = 86_400_000;
const CURRENT_DAYS = 30;
const STALE_DAYS = 90;
const REVIEW_SOON_DAYS = 14;
const PUBLIC_WORKFLOWS = new Set(['published', 'corrected', 'closed']);
const OPEN_STATUSES = new Set(['upcoming', 'open', 'closing-soon', 'application-open']);
const root = resolve(import.meta.dirname, '..');
const contentRoot = join(root, 'src/content/articles');
const outputRoot = join(root, '.artifacts');
const now = Date.now();

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return ['.md', '.mdx'].includes(extname(entry.name)) ? [path] : [];
  });
}

function frontmatter(path) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!match) throw new Error('missing YAML frontmatter');
  return parse(match[1]);
}

function asTime(value) {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function daysFloor(milliseconds) {
  return Math.floor(milliseconds / DAY_MS);
}

function daysCeil(milliseconds) {
  return Math.ceil(milliseconds / DAY_MS);
}

function deadlineFor(data) {
  return data.deadline ||
    data.job?.applicationDeadline ||
    data.admission?.applicationDeadline ||
    data.scholarship?.applicationDeadline ||
    data.alert?.expiryDate;
}

function structuredStatus(data) {
  return data.job?.recruitmentStatus ||
    data.scheme?.schemeStatus ||
    data.admission?.admissionStatus ||
    data.scholarship?.scholarshipStatus ||
    data.service?.serviceStatus;
}

function classify(data) {
  const deadlineTime = asTime(deadlineFor(data));
  const verifiedTime = asTime(data.lastVerified);
  const reviewTime = asTime(data.nextReviewDate);
  const daysUntilDeadline = deadlineTime === undefined ? undefined : daysCeil(deadlineTime - now);
  const daysSinceVerified = verifiedTime === undefined ? undefined : Math.max(0, daysFloor(now - verifiedTime));
  const daysUntilReview = reviewTime === undefined ? undefined : daysCeil(reviewTime - now);
  const terminal = ['closed', 'withdrawn', 'archived'].includes(data.workflowStatus) ||
    ['closed', 'withdrawn'].includes(data.verificationStatus);
  const expired = terminal || (deadlineTime !== undefined && deadlineTime < now);
  const status = structuredStatus(data);
  const contradictoryOpenState = expired && OPEN_STATUSES.has(status);

  if (contradictoryOpenState) {
    return { state: 'expired-open', priority: 'P0', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
  }
  if (expired) {
    return { state: 'expired', priority: 'P1', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
  }
  if (daysSinceVerified !== undefined && daysSinceVerified > STALE_DAYS) {
    return { state: 'stale', priority: 'P1', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
  }
  if ((daysUntilReview !== undefined && daysUntilReview < 0) || (!verifiedTime && data.verificationStatus === 'officially-confirmed')) {
    return { state: 'review-overdue', priority: 'P1', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
  }
  if ((daysUntilReview !== undefined && daysUntilReview <= REVIEW_SOON_DAYS) || (daysSinceVerified !== undefined && daysSinceVerified > CURRENT_DAYS)) {
    return { state: 'review-soon', priority: 'P2', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
  }
  return { state: 'current', priority: 'P3', daysUntilDeadline, daysSinceVerified, daysUntilReview, status };
}

const records = [];
const parseErrors = [];
for (const path of walk(contentRoot)) {
  const file = relative(root, path);
  try {
    const data = frontmatter(path);
    if (data.draft || !PUBLIC_WORKFLOWS.has(data.workflowStatus) || data.verificationStatus === 'withdrawn') continue;
    records.push({
      file,
      language: data.language,
      title: data.title,
      contentType: data.contentType,
      workflowStatus: data.workflowStatus,
      verificationStatus: data.verificationStatus,
      lastVerified: data.lastVerified || null,
      nextReviewDate: data.nextReviewDate || null,
      deadline: deadlineFor(data) || null,
      ...classify(data),
    });
  } catch (error) {
    parseErrors.push({ file, error: error.message });
  }
}

const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
records.sort((a, b) => {
  const priority = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priority !== 0) return priority;
  const aReview = a.daysUntilReview ?? Number.POSITIVE_INFINITY;
  const bReview = b.daysUntilReview ?? Number.POSITIVE_INFINITY;
  return aReview - bReview;
});

const totals = records.reduce((summary, record) => {
  summary[record.priority] += 1;
  summary[record.state] = (summary[record.state] || 0) + 1;
  return summary;
}, { P0: 0, P1: 0, P2: 0, P3: 0 });

const report = {
  generatedAt: new Date(now).toISOString(),
  policy: {
    currentVerificationDays: CURRENT_DAYS,
    staleVerificationDays: STALE_DAYS,
    reviewSoonDays: REVIEW_SOON_DAYS,
  },
  totals,
  parseErrors,
  records,
};

mkdirSync(outputRoot, { recursive: true });
writeFileSync(join(outputRoot, 'editorial-freshness-report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(`Editorial freshness audit: ${records.length} public record(s); P0=${totals.P0}, P1=${totals.P1}, P2=${totals.P2}, current=${totals.P3}.`);
for (const record of records.filter((item) => item.priority !== 'P3').slice(0, 20)) {
  console.log(`${record.priority} ${record.state}: ${record.file} — ${record.title}`);
}
if (parseErrors.length) {
  console.error(`Freshness audit could not parse ${parseErrors.length} file(s).`);
  process.exit(1);
}
