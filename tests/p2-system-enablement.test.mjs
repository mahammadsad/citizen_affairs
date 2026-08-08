import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const beats = ['job', 'exam', 'scheme', 'notice', 'service', 'alert'];

test('six citizen-service templates remain private and fail closed', async () => {
  for (const beat of beats) {
    const source = await readFile(`templates/editorial/${beat}.md.tmpl`, 'utf8');
    assert.match(source, new RegExp(`contentType: ${beat}`));
    assert.match(source, /language: bn/);
    assert.match(source, /workflowStatus: draft/);
    assert.match(source, /draft: true/);
    assert.match(source, /verificationStatus: under-verification/);
    assert.match(source, /independentReviewStatus: not-assigned/);
    assert.match(source, /checkBeforeActing: true/);
    assert.match(source, /correctionHistory: \[\]/);
    assert.match(source, /sourceUrls:/);
  }
});

test('structured schema and raw-content checks cover all six beats', async () => {
  const schema = await readFile('src/content.config.ts', 'utf8');
  const validator = await readFile('scripts/validate-content.mjs', 'utf8');
  assert.match(schema, /const examDetails = z\.object/);
  assert.match(schema, /const noticeDetails = z\.object/);
  assert.match(schema, /checkBeforeActing: z\.boolean\(\)\.default\(true\)/);
  assert.match(schema, /must remain draft until independent review is completed/);
  assert.match(validator, /need a current primary official source before publication/);
  for (const beat of beats) {
    assert.match(schema, new RegExp(`${beat}: ${beat}Details\\.optional\\(\\)`));
    assert.match(validator, new RegExp(`data\\.contentType === '${beat}'`));
  }
  for (const requiredField of [
    'officialNoticeUrl',
    'applicableGeography',
    'eligibilitySummary',
    'feeSummary',
  ]) assert.match(schema, new RegExp(requiredField));
});

test('P2 measurement and audience features stay specification-only', async () => {
  const events = await readFile('docs/PRIVACY_EVENT_DICTIONARY.md', 'utf8');
  for (const event of [
    'article_view',
    'official_action_click',
    'save',
    'share',
    'search',
    'zero_result',
    'language_switch',
    'correction_contact',
    'newsletter_signup',
  ]) assert.ok(events.includes('`' + event + '`'), `${event} must be documented`);
  assert.match(events, /collection disabled/i);

  const newsletter = await readFile('docs/NEWSLETTER_REQUIREMENTS.md', 'utf8');
  assert.match(newsletter, /not launched/i);
  assert.match(newsletter, /explicit, unticked consent/i);
  assert.match(newsletter, /one-click unsubscribe/i);

  const rum = await readFile('docs/RUM_FOLLOWS_AND_INFRASTRUCTURE_GATES.md', 'utf8');
  assert.match(rum, /implementation specifications, not enabled products/i);
  assert.match(rum, /LCP, INP and CLS/);
  assert.match(rum, /Accounts, push and email reminders remain disabled/);
  assert.match(rum, /Do not restore Supabase/);
});

test('six text-light visual templates remain unassigned after owner approval', async () => {
  const registry = JSON.parse(await readFile('src/data/editorial-assets.json', 'utf8'));
  const templates = registry.assets.filter((asset) => asset.assetKind === 'template');
  assert.equal(templates.length, 6);
  for (const asset of templates) {
    assert.deepEqual(asset.associatedArticles, []);
    assert.equal(asset.reviewStatus, 'approved-by-owner');
    assert.equal(asset.mobile390Reviewed, true);
    assert.equal(asset.desktop1440Reviewed, true);
    assert.equal(asset.humanOwnerApprovalRequiredBeforePublish, true);
    const svg = await readFile(asset.sourcePath, 'utf8');
    assert.doesNotMatch(svg, /<text\b/i);
    assert.match(svg, /viewBox="0 0 1200 675"/);
  }
});
