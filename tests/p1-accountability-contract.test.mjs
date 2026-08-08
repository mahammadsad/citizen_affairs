import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const content = await readFile('src/content.config.ts', 'utf8');
const schema = await readFile('src/components/ArticleStructuredData.astro', 'utf8');
const workflow = await readFile('.github/workflows/generate-review-drafts.yml', 'utf8');
const corrections = await readFile('docs/CORRECTIONS.md', 'utf8');

test('writer attribution and independent review fail closed', () => {
  assert.match(schema, /showHumanAuthor\s*=\s*normalizedAuthor\.length\s*>\s*0/);
  assert.match(schema, /'@type': 'Person'/);
  assert.match(content, /The writer cannot edit, fact-check, review, approve, or publish their own record/);
  assert.match(content, /independentReviewStatus/);
});

test('material corrections have accountable ticket fields and service targets', () => {
  for (const field of ['ticketId', 'severity', 'receivedAt', 'acknowledgedAt', 'resolvedAt', 'accountableEditor']) {
    assert.match(content, new RegExp(`${field}:`));
  }
  assert.match(corrections, /CA-COR-YYYY-NNN/);
  assert.match(corrections, /Critical[\s\S]*4 hours[\s\S]*12 hours/);
});

test('automation defaults to Bengali drafts and cannot merge itself', () => {
  assert.match(workflow, /DRAFT_LANGUAGES:.*\|\| 'bn'/);
  assert.match(workflow, /gh pr create[\s\S]*--draft/);
  assert.doesNotMatch(workflow, /gh pr merge/);
});
