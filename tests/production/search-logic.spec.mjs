import { expect, test } from '@playwright/test';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const noCacheHeaders = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
const transientNavigationStatuses = new Set([502, 503, 504]);

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

const gotoWithTransientServerRetry = async (page, target) => {
  let response;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const separator = target.includes('?') ? '&' : '?';
    response = await page.goto(`${target}${separator}smokeAttempt=${attempt}`, { waitUntil: 'domcontentloaded' });
    const status = response?.status();
    if (!transientNavigationStatuses.has(status) || attempt === 2) return response;
    console.warn(`Transient HTTP ${status} for ${target}; retrying the navigation once.`);
    await page.waitForTimeout(1_000);
  }
  return response;
};

test('live search presents one primary taxonomy and progressive secondary filters', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One browser is sufficient for the multilingual search contract.');

  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  await waitForExpectedBuild(request, expectedCommit);

  const cases = [
    { path: '/search/', more: 'More filters', scope: 'Government scope', location: 'Applicable location' },
    { path: '/bn/search/', more: 'আরও ফিল্টার', scope: 'সরকারের পরিধি', location: 'প্রযোজ্য এলাকা' },
    { path: '/hi/search/', more: 'और फ़िल्टर', scope: 'सरकारी दायरा', location: 'लागू क्षेत्र' },
  ];

  for (const item of cases) {
    const response = await gotoWithTransientServerRetry(
      page,
      `${item.path}?build=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`,
    );
    expect(response?.status(), `${item.path} should resolve`).toBe(200);

    await expect(page.locator('select[name="type"]')).toHaveCount(1);
    await expect(page.locator('select[name="category"]')).toHaveCount(0);

    const advanced = page.locator('#advancedSearchFilters');
    await expect(advanced).toHaveCount(1);
    expect(await advanced.evaluate((element) => element.open)).toBe(false);
    await advanced.locator('summary').click();
    expect(await advanced.evaluate((element) => element.open)).toBe(true);
    await expect(advanced.getByText(item.more, { exact: true })).toBeVisible();
    await expect(advanced.getByText(item.scope, { exact: true })).toBeVisible();
    await expect(advanced.getByText(item.location, { exact: true })).toBeVisible();

    const scopeValues = await advanced.locator('select[name="level"] option').evaluateAll((options) =>
      options.map((option) => option.value),
    );
    expect(scopeValues).toEqual(['', 'central', 'state']);
    await expect(page.locator('#resultCount')).not.toContainText(/Loading|লোড|लोड/);
  }

  const legacyResponse = await gotoWithTransientServerRetry(page, `/search/?category=jobs&nonce=${Date.now()}`);
  expect(legacyResponse?.status()).toBe(200);
  await expect(page.locator('select[name="type"]')).toHaveValue('job');
  await expect.poll(() => page.url()).not.toContain('category=');
  await expect.poll(() => page.url()).toContain('type=job');
});

test('English search results use canonical article links that resolve', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One browser is sufficient for the English route contract.');

  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  await waitForExpectedBuild(request, expectedCommit);

  const response = await gotoWithTransientServerRetry(page, `/search/?q=myscheme&nonce=${Date.now()}`);
  expect(response?.status()).toBe(200);

  const result = page.locator('a.search-result-link[href="/articles/find-government-schemes-with-myscheme/"]');
  await expect(result).toBeVisible();
  await expect(result).toContainText(/How to Find Government Schemes for You on the myScheme Portal/i);
  await expect(page.locator('.search-result-row')).toHaveCount(1);
  await expect(page.locator('a[href^="/en/articles/"]')).toHaveCount(0);

  const article = await request.get(`/articles/find-government-schemes-with-myscheme/?nonce=${Date.now()}`, {
    headers: noCacheHeaders,
  });
  expect(article.status()).toBe(200);
});
