import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(path, 'utf8');
const health = await read('src/pages/health.json.ts');
const statusPage = await read('src/pages/status.astro');
const serviceWorker = await read('src/pages/sw.js.ts');
const linkValidator = await read('scripts/validate-links.mjs');
const summary = await read('scripts/summarize-production-health.mjs');
const productionTest = await read('tests/production/production.spec.mjs');
const productionConfig = await read('playwright.production.config.mjs');
const packageJson = await read('package.json');
const deployWorkflow = await read('.github/workflows/deploy.yml');
const dailyWorkflow = await read('.github/workflows/production-health.yml');

test('served-build health and owner status do not overclaim live verification', () => {
  assert.match(health, /status: 'ready'/);
  assert.match(health, /scope: 'served-build'/);
  assert.match(health, /PUBLIC_BUILD_COMMIT/);
  assert.match(health, /liveSmoke: 'GitHub Actions/);
  assert.match(health, /Cache-Control': 'no-store/);
  assert.match(statusPage, /robots="noindex, follow"/);
  assert.match(statusPage, /Merged target/);
  assert.match(statusPage, /Served deployment/);
  assert.match(statusPage, /Verified live/);
  assert.match(statusPage, /does not claim a GitHub test result/);
});

test('generated internal link audit covers routes, assets, srcsets and fragments', () => {
  assert.match(linkValidator, /collectHtmlReferences/);
  assert.match(linkValidator, /collectCssReferences/);
  assert.match(linkValidator, /srcset/);
  assert.match(linkValidator, /missing internal target/);
  assert.match(linkValidator, /missing fragment/);
  assert.match(linkValidator, /internal-link-report\.json/);
  assert.match(packageJson, /"validate:links": "node scripts\/validate-links\.mjs"/);
});

test('deployment validation retains internal-link evidence before publishing', () => {
  assert.match(deployWorkflow, /Internal route, asset and fragment validation/);
  assert.match(deployWorkflow, /npm run validate:links/);
  assert.match(deployWorkflow, /internal-links-\$\{\{ github\.run_id \}\}/);
  assert.match(deployWorkflow, /internal-link-report\.json/);
});

test('production browser checks cover exact deployment, sitemap and real offline navigation', () => {
  assert.match(productionTest, /waitForExpectedBuild/);
  assert.match(productionTest, /every sitemap URL resolves/);
  assert.match(productionTest, /health\.json/);
  assert.match(productionTest, /navigator\.serviceWorker\.ready/);
  assert.match(productionTest, /context\.setOffline\(true\)/);
  assert.match(productionTest, /offline-probe-/);
  assert.match(productionTest, /Operational status/);
  assert.match(serviceWorker, /health\\\\\.json/);
  assert.match(serviceWorker, /\\\\\/status/);
});

test('production results become an owner-friendly release-stage summary', () => {
  assert.match(productionConfig, /\['json', \{ outputFile:/);
  assert.match(summary, /production-health-report\.json/);
  assert.match(summary, /production-health-summary\.md/);
  assert.match(summary, /Merged/);
  assert.match(summary, /Deployed/);
  assert.match(summary, /Verified live/);
  assert.match(summary, /GITHUB_STEP_SUMMARY/);
  assert.match(deployWorkflow, /Summarize merged, deployed and verified-live stages/);
  assert.match(deployWorkflow, /RELEASE_MERGED: "true"/);
});

test('daily production health is read-only, scheduled and independently retained', () => {
  assert.match(dailyWorkflow, /cron: "15 3 \* \* \*"/);
  assert.match(dailyWorkflow, /permissions:\n  contents: read/);
  assert.match(dailyWorkflow, /Verify live production without deploying/);
  assert.match(dailyWorkflow, /Write owner-friendly health summary/);
  assert.match(dailyWorkflow, /daily-production-health-\$\{\{ github\.run_id \}\}/);
  assert.doesNotMatch(dailyWorkflow, /deploy-pages/);
  assert.doesNotMatch(dailyWorkflow, /pages: write/);
});
