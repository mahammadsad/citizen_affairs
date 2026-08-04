import { expect, test } from '@playwright/test';

const oldBrand = /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র/i;
const inactiveCategoryLabels = [/^Exams$/i, /^Study Materials$/i, /^Notices$/i, /^Current Affairs$/i];
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const collectSchemaTypes = (value) => {
  const queue = Array.isArray(value) ? [...value] : [value];
  const types = [];
  for (const node of queue) {
    if (!node || typeof node !== 'object') continue;
    const nodeTypes = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    types.push(...nodeTypes.filter((type) => typeof type === 'string'));
    if (Array.isArray(node['@graph'])) queue.push(...node['@graph']);
  }
  return types;
};

const waitForExpectedBuild = async (request, expectedCommit) => {
  if (!expectedCommit) return;
  let lastSeen = 'unavailable';
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    const marker = await request.get(
      `/deployment.json?expected=${encodeURIComponent(expectedCommit)}&attempt=${attempt}&nonce=${Date.now()}`,
      { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } }
    );
    if (marker.ok()) {
      const payload = await marker.json().catch(() => ({}));
      lastSeen = payload.commit || 'missing';
      if (lastSeen === expectedCommit) return;
    } else {
      lastSeen = `HTTP ${marker.status()}`;
    }
    await sleep(5_000);
  }
  throw new Error(`Production did not reach commit ${expectedCommit}; last marker was ${lastSeen}`);
};

test('production homepage and discoverability are healthy', async ({ page, request }, testInfo) => {
  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  await waitForExpectedBuild(request, expectedCommit);

  const response = await page.goto(`/?build=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`, {
    waitUntil: 'networkidle'
  });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Citizen Affairs/i);
  await expect(page.locator('header img[alt*="Citizen Affairs"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /search|খুঁজুন|खोजें/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /language|ভাষা|भाषा/i }).first()).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await expect(page.getByRole('button', { name: /menu|মেনু|मेनू/i })).toBeVisible();
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/citizenaffairs\.in\//);
  await expect(page.locator('body')).not.toContainText(oldBrand);
  for (const label of inactiveCategoryLabels) {
    await expect(page.getByText(label)).toHaveCount(0);
  }
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/i);
  if (expectedCommit) {
    await expect(page.locator('meta[name="x-build-commit"]')).toHaveAttribute('content', expectedCommit);
  }

  for (const path of ['/sitemap.xml', '/robots.txt']) {
    const resource = await request.get(`${path}?build=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
    });
    expect(resource.status(), `${path} should be available`).toBe(200);
  }
  await page.screenshot({ path: `test-results/production-${testInfo.project.name}.png`, fullPage: true });
});

test('staff workspace is excluded from indexing', async ({ page }) => {
  await page.goto(`/staff/?nonce=${Date.now()}`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex,\s*nofollow/i);
});

test('published article is available when sitemap lists one', async ({ page, request }) => {
  const sitemap = await (await request.get(`/sitemap.xml?nonce=${Date.now()}`)).text();
  const article = sitemap.match(/<loc>(https:\/\/citizenaffairs\.in\/(?:en|bn|hi)\/articles\/[^<]+)<\/loc>/)?.[1];
  if (!article) return;
  const response = await page.goto(`${article}?nonce=${Date.now()}`);
  expect(response?.status()).toBe(200);
  const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((source) => JSON.parse(source));
  const articleTypes = schemas.flatMap(collectSchemaTypes).filter((type) => type === 'Article' || type === 'NewsArticle');
  expect(articleTypes).toHaveLength(1);
});
