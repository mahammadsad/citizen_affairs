import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const freshness = await readFile('src/lib/freshness.ts', 'utf8');
const content = await readFile('src/lib/content.ts', 'utf8');
const route = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const notice = await readFile('src/components/ArticleFreshnessNotice.astro', 'utf8');
const audit = await readFile('scripts/audit-freshness.mjs', 'utf8');
const validator = await readFile('scripts/validate-content.mjs', 'utf8');
const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
const packageJson = await readFile('package.json', 'utf8');

test('freshness policy has explicit current, review and stale thresholds', () => {
  assert.match(freshness, /currentVerificationDays: 30/);
  assert.match(freshness, /staleVerificationDays: 90/);
  assert.match(freshness, /reviewSoonDays: 14/);
  assert.match(freshness, /'review-overdue'/);
  assert.match(freshness, /'expired'/);
  assert.match(freshness, /applicationAllowed: !expired/);
});

test('expired opportunities leave current discovery without losing their direct pages', () => {
  assert.match(content, /isCurrentListingCandidate\(article\.data, now\)/);
  assert.match(content, /getAllLocalizedPublicArticles/);
  assert.match(content, /getArticleTranslation[\s\S]*getAllLocalizedPublicArticles/);
  assert.match(route, /\['published', 'corrected', 'closed'\]/);
  assert.match(route, /canOfferApplicationAction\(article\.data\)/);
  assert.match(route, /applicationUrl=\{safeApplicationUrl\}/);
});

test('article pages show multilingual freshness guidance and suppress expired applications', () => {
  assert.match(route, /<ArticleFreshnessNotice/);
  assert.match(notice, /Application window closed/);
  assert.match(notice, /আবেদনের সময় শেষ/);
  assert.match(notice, /आवेदन अवधि समाप्त/);
  assert.match(notice, /data-article-freshness=\{freshness\.state\}/);
  assert.match(notice, /application actions are not shown/);
});

test('editorial audit produces ranked actionable records', () => {
  assert.match(audit, /priority: 'P0'/);
  assert.match(audit, /priority: 'P1'/);
  assert.match(audit, /priority: 'P2'/);
  assert.match(audit, /priority: 'P3'/);
  assert.match(audit, /editorial-freshness-report\.json/);
  assert.match(audit, /expired-open/);
  assert.match(packageJson, /"audit:freshness": "node scripts\/audit-freshness\.mjs"/);
});

test('CI retains the freshness report for editorial follow-up', () => {
  assert.match(workflow, /name: Editorial freshness audit/);
  assert.match(workflow, /run: npm run audit:freshness/);
  assert.match(workflow, /name: editorial-freshness-\$\{\{ github\.run_id \}\}/);
  assert.match(workflow, /retention-days: 30/);
});

test('content validation permits transparent closed records but rejects expired open opportunities', () => {
  assert.match(validator, /publicWorkflows = new Set\(\['published', 'corrected', 'closed'\]\)/);
  assert.match(validator, /rejectExpiredOpenOpportunity/);
  assert.match(validator, /data\.admission\?\.admissionStatus/);
  assert.match(validator, /data\.scholarship\?\.scholarshipStatus/);
});
