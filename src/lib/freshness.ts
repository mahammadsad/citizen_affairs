import type { CollectionEntry } from 'astro:content';

export const DAY_MS = 86_400_000;
export const FRESHNESS_POLICY = {
  currentVerificationDays: 30,
  staleVerificationDays: 90,
  reviewSoonDays: 14,
} as const;

export type ArticleFreshnessState =
  | 'current'
  | 'review-soon'
  | 'review-overdue'
  | 'stale'
  | 'expired';

type ArticleData = CollectionEntry<'articles'>['data'];

export interface ArticleFreshness {
  state: ArticleFreshnessState;
  priority: 0 | 1 | 2 | 3;
  daysSinceVerified?: number;
  daysUntilReview?: number;
  daysUntilDeadline?: number;
  applicationAllowed: boolean;
  currentListingAllowed: boolean;
}

const wholeDays = (milliseconds: number) => Math.floor(milliseconds / DAY_MS);
const ceilingDays = (milliseconds: number) => Math.ceil(milliseconds / DAY_MS);

export function getArticleFreshness(
  data: Pick<
    ArticleData,
    | 'contentType'
    | 'workflowStatus'
    | 'verificationStatus'
    | 'lastVerified'
    | 'nextReviewDate'
    | 'deadline'
  >,
  now = new Date(),
): ArticleFreshness {
  const nowTime = now.getTime();
  const deadlineTime = data.deadline?.getTime();
  const lastVerifiedTime = data.lastVerified?.getTime();
  const reviewTime = data.nextReviewDate?.getTime();
  const daysUntilDeadline = deadlineTime === undefined
    ? undefined
    : ceilingDays(deadlineTime - nowTime);
  const daysSinceVerified = lastVerifiedTime === undefined
    ? undefined
    : Math.max(0, wholeDays(nowTime - lastVerifiedTime));
  const daysUntilReview = reviewTime === undefined
    ? undefined
    : ceilingDays(reviewTime - nowTime);

  const terminalWorkflow = ['closed', 'withdrawn', 'archived'].includes(data.workflowStatus);
  const terminalVerification = ['closed', 'withdrawn'].includes(data.verificationStatus);
  const expiredDeadline = deadlineTime !== undefined && deadlineTime < nowTime;
  const expired = terminalWorkflow || terminalVerification || expiredDeadline;

  let state: ArticleFreshnessState = 'current';
  if (expired) {
    state = 'expired';
  } else if (daysSinceVerified !== undefined && daysSinceVerified > FRESHNESS_POLICY.staleVerificationDays) {
    state = 'stale';
  } else if (
    (daysUntilReview !== undefined && daysUntilReview < 0) ||
    (!data.lastVerified && data.verificationStatus === 'officially-confirmed')
  ) {
    state = 'review-overdue';
  } else if (
    (daysUntilReview !== undefined && daysUntilReview <= FRESHNESS_POLICY.reviewSoonDays) ||
    (daysSinceVerified !== undefined && daysSinceVerified > FRESHNESS_POLICY.currentVerificationDays)
  ) {
    state = 'review-soon';
  }

  const priority = state === 'expired'
    ? 3
    : state === 'stale' || state === 'review-overdue'
      ? 2
      : state === 'review-soon'
        ? 1
        : 0;

  return {
    state,
    priority,
    daysSinceVerified,
    daysUntilReview,
    daysUntilDeadline,
    applicationAllowed: !expired,
    currentListingAllowed: !expired,
  };
}

export function isCurrentListingCandidate(data: ArticleData, now = new Date()) {
  return getArticleFreshness(data, now).currentListingAllowed;
}

export function canOfferApplicationAction(data: ArticleData, now = new Date()) {
  return getArticleFreshness(data, now).applicationAllowed;
}

export function compareArticleFreshness(a: ArticleData, b: ArticleData, now = new Date()) {
  const aFreshness = getArticleFreshness(a, now);
  const bFreshness = getArticleFreshness(b, now);
  if (aFreshness.priority !== bFreshness.priority) return aFreshness.priority - bFreshness.priority;
  return b.date.getTime() - a.date.getTime();
}
