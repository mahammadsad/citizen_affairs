import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = await readFile('.pages.yml', 'utf8');
const admin = await readFile('public/admin/index.html', 'utf8');
const exporter = await readFile('scripts/export-approved-content.mjs', 'utf8');
const draftRepository = await readFile('automation/app/draft_repository.py', 'utf8');

test('Pages CMS presents private drafts and live articles as separate sections', () => {
  assert.match(pages, /🟡 Draft articles — NOT LIVE/);
  assert.match(pages, /🟢 Live articles — PUBLISHED/);
  assert.match(pages, /name: english-drafts[\s\S]*path: src\/content\/articles\/en\/drafts/);
  assert.match(pages, /name: english-live[\s\S]*path: src\/content\/articles\/en\n[\s\S]*subfolders: false/);
  assert.match(pages, /operations: \{ create: false, rename: false, delete: false \}/);
  assert.match(pages, /fields: \[workflowStatus, title, verificationStatus, category, date\]/);
});

test('owner admin entry point opens the private English draft collection directly', () => {
  assert.match(admin, /citizen_affairs\/cms\/collection\/english-drafts/);
  assert.doesNotMatch(admin, /collection\/english-articles/);
});

test('automation writes drafts only to nested draft folders', () => {
  assert.match(draftRepository, /self\.article_root \/ language \/ "drafts"/);
  assert.match(draftRepository, /glob\("\*\*\/\*\.md"\)/);
});

test('publication promotes the live copy and removes a matching private draft', () => {
  assert.match(exporter, /const output = path\.join\(directory, `\$\{article\.slug\}\.md`\)/);
  assert.match(exporter, /const privateDraft = path\.join\(directory, 'drafts', `\$\{article\.slug\}\.md`\)/);
  assert.match(exporter, /await unlink\(privateDraft\)/);
  assert.match(exporter, /error\?\.code !== 'ENOENT'/);
});
