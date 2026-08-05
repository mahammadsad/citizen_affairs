import { expect, test } from '@playwright/test';

const noCacheHeaders = { 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForExpectedBuild = async (request, expectedCommit) => {
  if (!expectedCommit) return;
  let lastSeen = 'unavailable';
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    const response = await request.get(
      `/deployment.json?homepage-image=${attempt}&expected=${encodeURIComponent(expectedCommit)}&nonce=${Date.now()}`,
      { headers: noCacheHeaders },
    );
    if (response.ok()) {
      const deployment = await response.json().catch(() => ({}));
      lastSeen = deployment.commit || 'missing';
      if (lastSeen === expectedCommit) return;
    } else {
      lastSeen = `HTTP ${response.status()}`;
    }
    await sleep(5_000);
  }
  throw new Error(`Production did not reach commit ${expectedCommit}; last marker was ${lastSeen}`);
};

test('live Bengali homepage is led by a loaded responsive editorial image', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'offline', 'The isolated offline project verifies service-worker fallback only.');

  const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
  await waitForExpectedBuild(request, expectedCommit);
  const response = await page.goto(
    `/bn/?homepage-image=${encodeURIComponent(expectedCommit || 'current')}&nonce=${Date.now()}`,
    { waitUntil: 'networkidle' },
  );
  expect(response?.status()).toBe(200);

  const lead = page.locator('.lead-story');
  const picture = lead.locator('[data-story-image="lead"]');
  const image = picture.locator('img');
  const heading = lead.locator('h2');

  await expect(lead).toBeVisible();
  await expect(picture).toBeVisible();
  await expect(picture.locator('source[type="image/avif"]')).toHaveCount(1);
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('srcset', /480w.*768w.*1200w/);
  await expect(image).toHaveAttribute('sizes', /100vw/);
  await expect(image).toHaveAttribute('width', '1200');
  await expect(image).toHaveAttribute('height', '675');
  await expect(image).toHaveAttribute('alt', /.+/);
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect(image).toHaveAttribute('fetchpriority', 'high');

  const rendering = await page.evaluate(() => {
    const image = document.querySelector('.lead-story [data-story-image="lead"] img');
    const heading = document.querySelector('.lead-story h2');
    if (!(image instanceof HTMLImageElement) || !(heading instanceof HTMLElement)) {
      throw new Error('Lead story image or heading missing');
    }
    const imageRect = image.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return {
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      ratio: imageRect.width / imageRect.height,
      imageBottom: imageRect.bottom,
      headingTop: headingRect.top,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(rendering.complete).toBe(true);
  expect(rendering.naturalWidth).toBeGreaterThan(0);
  expect(rendering.ratio).toBeCloseTo(16 / 9, 1);
  expect(rendering.imageBottom).toBeLessThanOrEqual(rendering.headingTop);
  expect(rendering.documentWidth).toBeLessThanOrEqual(rendering.viewportWidth);

  await expect(heading).toBeVisible();
  await page.screenshot({ path: `test-results/production-homepage-image-${testInfo.project.name}.png`, fullPage: true });
});
