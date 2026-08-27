import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const helper = await readFile('src/lib/official-links.ts', 'utf8');
const action = await readFile('src/components/OfficialActionLink.astro', 'utf8');
const workspace = await readFile('src/components/ArticleDecisionWorkspace.astro', 'utf8');
const card = await readFile('src/components/ArticleCard.astro', 'utf8');
const runtime = await readFile('src/components/PortalRuntime.astro', 'utf8');

test('official destinations distinguish government and institution domains without overclaiming', () => {
  assert.match(helper, /hostname\.endsWith\('\.gov\.in'\)/);
  assert.match(helper, /hostname\.endsWith\('\.nic\.in'\)/);
  assert.match(helper, /hostname\.endsWith\('\.ac\.in'\)/);
  assert.match(helper, /hostname\.endsWith\('\.edu\.in'\)/);
  assert.match(helper, /'listed-source'/);
  assert.match(helper, /parsed\.protocol === 'https:'/);
  assert.match(helper, /catch \{/);
});

test('source freshness uses explicit current, review-soon and stale thresholds', () => {
  assert.match(helper, /ageDays <= 30/);
  assert.match(helper, /ageDays <= 90/);
  assert.match(helper, /return 'stale'/);
  assert.match(helper, /return 'unknown'/);
  assert.match(helper, /Verified within 30 days/);
  assert.match(helper, /গত ৩০ দিনের মধ্যে যাচাই করা/);
  assert.match(helper, /पिछले 30 दिनों में सत्यापित/);
});

test('official action handoff exposes destination, security and privacy-safe attributes', () => {
  assert.match(action, /officialLinkIdentity/);
  assert.match(action, /sourceFreshness/);
  assert.match(action, /referrerpolicy="no-referrer"/);
  assert.match(action, /rel="noopener noreferrer external"/);
  assert.match(action, /identity\.hostname/);
  assert.match(action, /You are leaving Citizen Affairs/);
  assert.match(action, /আপনি Citizen Affairs থেকে বাইরে যাচ্ছেন/);
  assert.match(action, /आप Citizen Affairs से बाहर जा रहे हैं/);
  assert.match(action, /Check the domain before entering personal details, payment information or an OTP/);
});

test('decision workspace uses trusted handoff components for applications and notices', () => {
  assert.match(workspace, /OfficialActionLink/);
  assert.match(workspace, /actionType="application"/);
  assert.match(workspace, /actionType="notice"/);
  assert.match(workspace, /data-action-safety/);
  assert.match(workspace, /Never share an OTP with another person/);
  assert.doesNotMatch(workspace, /<a class="btn btn-primary" href=\{applicationUrl\}/);
});

test('editorial cards stay internal while legacy source panels harden external navigation', () => {
  assert.doesNotMatch(card, /target="_blank"/);
  assert.doesNotMatch(card, /officialLinkIdentity|officialIdentity\.hostname/);
  assert.match(runtime, /hardenExternalLinks/);
  assert.match(runtime, /\.source-panel a\[target="_blank"\]/);
  assert.match(runtime, /link\.referrerPolicy = 'no-referrer'/);
  assert.match(runtime, /external-domain-cue/);
});

test('source-panel primary actions keep readable contrast after the domain cue is injected', () => {
  assert.match(runtime, /\.source-panel \.source-actions \.btn-primary\s*\{[\s\S]*?color: #fff !important;/);
  assert.match(runtime, /\.source-panel \.source-actions \.btn-primary \.external-domain-cue\s*\{[\s\S]*?rgba\(255, 255, 255, \.82\) !important;/);
  assert.match(runtime, /@media \(max-width: 700px\)[\s\S]*?\.source-panel \.source-actions[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
});
