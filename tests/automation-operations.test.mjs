import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const reviewWorkflow = await readFile('.github/workflows/generate-review-drafts.yml', 'utf8');
const legacyWorkflow = await readFile('.github/workflows/generate-drafts.yml', 'utf8');
const productionConfig = await readFile('playwright.production.config.mjs', 'utf8');
const productionSummary = await readFile('scripts/summarize-production-health.mjs', 'utf8');

test('review workflow is the only scheduled repository draft generator', () => {
  assert.match(reviewWorkflow, /schedule:/);
  assert.match(reviewWorkflow, /MAX_DRAFTS_PER_RUN:\s*"1"/);
  assert.match(reviewWorkflow, /EDITORIAL_GITHUB_TOKEN/);
  assert.match(reviewWorkflow, /gh pr checks/);
  assert.match(reviewWorkflow, /gh pr merge/);
  assert.match(reviewWorkflow, /--match-head-commit/);
  assert.match(reviewWorkflow, /draft:\[\[:space:\]\]\*true/);

  assert.doesNotMatch(legacyWorkflow, /schedule:/);
  assert.doesNotMatch(legacyWorkflow, /workflow_dispatch:/);
  assert.doesNotMatch(legacyWorkflow, /git push origin HEAD:main/);
  assert.doesNotMatch(legacyWorkflow, /generate-drafts/);
});

test('production verification allows one visible retry without hiding flakiness', () => {
  assert.match(productionConfig, /retries:\s*1/);
  assert.match(productionSummary, /retry-assisted/);
  assert.match(productionSummary, /verified-with-retry/);
});
