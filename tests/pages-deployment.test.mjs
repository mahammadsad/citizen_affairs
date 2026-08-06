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
  assert.match(workflow, /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/);
  assert.match(workflow, /timeout-minutes: 25/);
  assert.equal((workflow.match(/timeout: 600000/g) || []).length, 2);
  assert.match(workflow, /Deploy to GitHub Pages \(attempt 1\)/);
  assert.match(workflow, /Deploy to GitHub Pages \(attempt 2\)/);
  assert.match(workflow, /Pause before Pages retry/);
  assert.match(workflow, /Select successful Pages deployment/);
  assert.doesNotMatch(workflow, /timeout: 1200000/);
  assert.doesNotMatch(workflow, /group: ["']pages["']/);
  assert.doesNotMatch(workflow, /cancel-in-progress: true/);
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
