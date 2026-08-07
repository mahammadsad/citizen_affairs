import { expect, test } from '@playwright/test';

const oldBrand = /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র/i;
const inactiveCategoryLabels = [/^Exams$/i, /^Study Materials$/i, /^Notices$/i, /^Current Affairs$/i];
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const noCacheHeaders = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };

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

const extractJsonLd = (html) =>
  [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => JSON.parse(match[1].trim()),
  );

const requestFresh = (request, path) =>
  request.get(`${path}${path.includes('?') ? '&' : '?'}nonce=${Date.now()}`, {
    headers: noCacheHeaders,
  });

const waitForExpectedBuild = async (request, expectedCommit) => {
  if (!expectedCommit) return;
  let lastSeen = 'unavailable';
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    const marker = await request.get(
      `/deployment.json?expected=${encodeURIComponent(expectedCommit)}&attempt=${attempt}&nonce=${Date.now()}`,
      { headers: noCacheHeaders },
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
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Citizen Affairs/i);
  await expect(
    page.locator('.portal-navbar .portal-brand > img[alt*="Citizen Affairs"]'),
  ).toHaveCount(1);
  await expect(page.locator('.top-news')).toBeVisible();
  await expect(page.locator('.trending-section')).toHaveCount(0);
  await expect(page.locator('.section-empty')).toHaveCount(0);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /language|ভাষা|भाषा/i }).first()).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.portal-mobile-bottom')).toBeHidden();
    await expect(page.getByRole('button', { name: /menu|মেনু|मेनू/i })).toBeVisible();
  } else {
    await expect(page.locator('.portal-search-action[href*="/search"]')).toBeVisible();
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /^https:\/\/citizenaffairs\.in\//,
  );
  await expect(page.locator('body')).not.toContainText(oldBrand);
  for (const label of inactiveCategoryLabels) {
    await expect(page.getByText(label)).toHaveCount(0);
  }
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/i);
  if (expectedCommit) {
    await expect(page.locator('meta[name="x-build-commit"]')).toHaveAttribute('content', expectedCommit);
  }

  const bengaliResponse = await page.goto(
    `/bn/?build=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`,
    { waitUntil: 'networkidle' },
  );
  expect(bengaliResponse?.status()).toBe(200);
  await expect(page.locator('.top-news')).toBeVisible();
  await expect(page.locator('.lead-story')).toBeVisible();
  await expect(page.locator('.latest-rail')).toBeVisible();
  expect(await page.locator('.news-section-block').count()).toBeGreaterThan(0);
  await expect(page.locator('.trending-section')).toHaveCount(0);
  await expect(page.locator('.section-empty')).toHaveCount(0);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.portal-mobile-bottom')).toBeHidden();

    const menuTrigger = page.locator('.portal-mobile-trigger');
    const panel = page.locator('.portal-mobile-panel');
    const content = page.locator('.top-news');
    const before = await content.boundingBox();

    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(panel.locator('nav a').first()).toBeVisible();
    await expect(panel.locator('.portal-mobile-utility-link[href*="/search"]')).toBeVisible();
    await expect(panel.locator('.portal-mobile-utility-link[href*="/saved"]')).toBeVisible();
    await expect(page.locator('.portal-mobile-bottom')).toBeHidden();

    const after = await content.boundingBox();
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (before && after) expect(after.y - before.y).toBeGreaterThan(100);

    await page.keyboard.press('Escape');
    await expect(menuTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect(menuTrigger).toBeFocused();
  } else {
    await expect(page.locator('.portal-search-action[href*="/search"]')).toBeVisible();
  }

  for (const path of ['/sitemap.xml', '/robots.txt']) {
    const resource = await requestFresh(request, path);
    expect(resource.status(), `${path} should be available`).toBe(200);
  }
  await page.screenshot({ path: `test-results/production-${testInfo.project.name}.png`, fullPage: true });
});

test('operational endpoints expose the served build without overclaiming verification', async ({ page, request }) => {
  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  const deployment = await requestFresh(request, '/deployment.json');
  const health = await requestFresh(request, '/health.json');
  const manifest = await requestFresh(request, '/site.webmanifest');
  const worker = await requestFresh(request, '/sw.js');

  expect(deployment.status()).toBe(200);
  expect(health.status()).toBe(200);
  expect(manifest.status()).toBe(200);
  expect(worker.status()).toBe(200);

  const deploymentPayload = await deployment.json();
  const healthPayload = await health.json();
  const manifestPayload = await manifest.json();
  const workerSource = await worker.text();

  expect(healthPayload.status).toBe('ready');
  expect(healthPayload.scope).toBe('served-build');
  expect(healthPayload.commit).toBe(deploymentPayload.commit);
  expect(healthPayload.verification.liveSmoke).toContain('GitHub Actions');
  expect(manifestPayload.id).toBeTruthy();
  expect(manifestPayload.shortcuts.length).toBeGreaterThanOrEqual(2);
  expect(workerSource).toContain('CACHE_PREFIX');
  expect(workerSource).toContain('health\\.json');
  expect(workerSource).toContain('status');
  if (expectedCommit) {
    expect(deploymentPayload.commit).toBe(expectedCommit);
    expect(workerSource).toContain(expectedCommit);
  }

  for (const path of healthPayload.resources.offline) {
    const response = await requestFresh(request, path);
    expect(response.status(), `${path} should be available`).toBe(200);
    expect(await response.text()).toMatch(/noindex,\s*nofollow/i);
  }

  const statusResponse = await page.goto(`/status/?nonce=${Date.now()}`, { waitUntil: 'networkidle' });
  expect(statusResponse?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  await expect(page.getByRole('heading', { name: 'Operational status' })).toBeVisible();
  await expect(page.getByText('Merged target', { exact: true })).toBeVisible();
  await expect(page.getByText('Served deployment', { exact: true })).toBeVisible();
  await expect(page.getByText('Verified live', { exact: true })).toBeVisible();
});

test('staff workspace is excluded from indexing', async ({ page }) => {
  await page.goto(`/staff/?nonce=${Date.now()}`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex,\s*nofollow/i);
});

test('every sitemap URL resolves from the live deployment', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One project is sufficient for the deployment-wide URL audit.');
  const sitemapResponse = await requestFresh(request, '/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/citizenaffairs\.in\/[^<]*)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls.length).toBeGreaterThan(0);

  for (let index = 0; index < urls.length; index += 8) {
    const batch = urls.slice(index, index + 8);
    const responses = await Promise.all(
      batch.map((url) =>
        request.get(`${url}${url.includes('?') ? '&' : '?'}health=${Date.now()}`, {
          headers: noCacheHeaders,
        }),
      ),
    );
    responses.forEach((response, offset) => {
      expect(response.status(), `${batch[offset]} should resolve`).toBe(200);
    });
  }
});

test('published article is available when sitemap lists one', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One project is sufficient for the live article schema check.');
  const sitemap = await (await requestFresh(request, '/sitemap.xml')).text();
  const article = sitemap.match(
    /<loc>(https:\/\/citizenaffairs\.in\/(?:en|bn|hi)\/articles\/[^<]+)<\/loc>/,
  )?.[1];
  if (!article) return;

  const response = await request.get(`${article}?nonce=${Date.now()}`, { headers: noCacheHeaders });
  expect(response.status()).toBe(200);
  const schemas = extractJsonLd(await response.text());
  const articleTypes = schemas
    .flatMap(collectSchemaTypes)
    .filter((type) => type === 'Article' || type === 'NewsArticle');
  expect(articleTypes).toHaveLength(1);
});

test('live service worker provides the multilingual offline fallback', async ({ page, context }) => {
  await page.goto(`/?service-worker=${Date.now()}`, { waitUntil: 'load' });
  const active = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Service worker activation timed out')), 30_000),
      ),
    ]);
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 10_000);
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    }
    return Boolean(registration.active);
  });
  expect(active).toBe(true);
  await page.reload({ waitUntil: 'networkidle' });

  await context.setOffline(true);
  try {
    const response = await page.goto(`/offline-probe-${Date.now()}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: /You are offline|আপনি অফলাইনে আছেন|आप ऑफलाइन हैं/i }),
    ).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
