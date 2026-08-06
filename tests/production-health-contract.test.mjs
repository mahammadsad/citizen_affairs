import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const playwrightConfig = await readFile('playwright.production.config.mjs', 'utf8');
const healthSummary = await readFile('scripts/summarize-production-health.mjs', 'utf8');

test('production browser checks remain serial and expose failures directly', () => {
  assert.match(playwrightConfig, /workers: 1/);
  assert.match(playwrightConfig, /retries: 0/);
  assert.match(playwrightConfig, /actionTimeout: 20_000/);
  assert.match(playwrightConfig, /navigationTimeout: 45_000/);
});

test('production verification quality is explicit in the owner summary', () => {
  assert.match(healthSummary, /verificationQuality/);
  assert.match(healthSummary, /attention-required/);
  assert.match(healthSummary, /Verification quality/);
  assert.match(healthSummary, /not marked verified until the complete production browser suite passes/);
});
