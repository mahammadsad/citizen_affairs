import { expect, test } from '@playwright/test';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const noCacheHeaders = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };

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

test('live About pages label and route the founder destination as Team', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One browser is sufficient for the multilingual route contract.');

  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  await waitForExpectedBuild(request, expectedCommit);

  const cases = [
    { path: '/about/', label: 'Our Team', href: '/team/' },
    { path: '/bn/about/', label: 'আমাদের টিম', href: '/bn/team/' },
    { path: '/hi/about/', label: 'हमारी टीम', href: '/hi/team/' },
  ];

  for (const item of cases) {
    const response = await page.goto(
      `${item.path}?build=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`,
      { waitUntil: 'networkidle' },
    );
    expect(response?.status(), `${item.path} should resolve`).toBe(200);

    const trustLinks = page.locator('.trust-links').first();
    const teamLink = trustLinks.getByRole('link', { name: item.label, exact: true });

    await expect(teamLink).toHaveAttribute('href', item.href);
    await expect(trustLinks.locator('a[href*="/authors/"]')).toHaveCount(0);

    await teamLink.click();
    await expect(page).toHaveURL(new RegExp(`${item.href.replaceAll('/', '\\/')}(?:[?#].*)?$`));
    await expect(page.getByRole('heading', { level: 1, name: item.label, exact: true })).toBeVisible();
  }
});
