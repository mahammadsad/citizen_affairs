import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
const marker = await readFile('src/pages/deployment.json.ts', 'utf8');
const productionTest = await readFile('tests/production/production.spec.mjs', 'utf8');
const productionConfig = await readFile('playwright.production.config.mjs', 'utf8');

test('production deployments no longer share one queue with pull request validation', () => {
  assert.match(workflow, /pages-pr-\{0\}/);
  assert.match(workflow, /pages-production/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /timeout-minutes: 10/);
  assert.doesNotMatch(workflow, /group: ["']pages["']/);
});

test('the static build exposes an exact deployment marker', () => {
  assert.match(marker, /export const prerender = true/);
  assert.match(marker, /PUBLIC_BUILD_COMMIT/);
  assert.match(marker, /service: 'citizen-affairs'/);
  assert.match(marker, /Cache-Control/);
});

test('production smoke waits for the deployed commit and bypasses stale caches', () => {
  assert.match(productionTest, /waitForExpectedBuild/);
  assert.match(productionTest, /deployment\.json\?expected=/);
  assert.match(productionTest, /Cache-Control': 'no-cache'/);
  assert.match(productionTest, /last marker was/);
  assert.match(productionTest, /meta\[name="x-build-commit"\]/);
  assert.match(productionConfig, /timeout: 180_000/);
});
