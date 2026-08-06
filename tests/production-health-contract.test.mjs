import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const playwrightConfig = await readFile('playwright.production.config.mjs', 'utf8');
const healthSummary = await readFile('scripts/summarize-production-health.mjs', 'utf8');

test('production browser checks retry a transient CI failure once', () => {
  assert.match(playwrightConfig, /retries: process\.env\.CI \? 1 : 0/);
  assert.match(playwrightConfig, /actionTimeout: 20_000/);
  assert.match(playwrightConfig, /navigationTimeout: 45_000/);
});

test('retry-assisted verification is visible and not reported as clean', () => {
  assert.match(healthSummary, /verified-with-retry/);
  assert.match(healthSummary, /retry-assisted/);
  assert.match(healthSummary, /investigate flaky test/);
  assert.match(healthSummary, /Verification quality/);
});
