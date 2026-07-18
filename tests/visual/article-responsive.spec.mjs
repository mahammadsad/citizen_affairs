import { expect, test } from '@playwright/test';

const articlePath = '/bn/articles/india-major-welfare-schemes-official-guide/';
const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
];

for (const viewport of viewports) {
  test(`featured image is complete and centred at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto(articlePath, { waitUntil: 'networkidle' });
    const image = page.locator('.article-hero-image');
    await expect(image).toBeVisible();
    await expect(page.locator('.brand img')).toHaveCount(1);
    await expect(page.locator('#searchToggle')).toBeVisible();
    await expect(page.locator('#languageTrigger')).toBeVisible();
    if (viewport.width < 860) await expect(page.locator('#menuToggle')).toBeVisible();

    const measurements = await image.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const viewportWidth = document.documentElement.clientWidth;
      const overflowing = Array.from(document.querySelectorAll('body *'))
        .map((candidate) => {
          const bounds = candidate.getBoundingClientRect();
          return {
            element: `${candidate.tagName.toLowerCase()}${candidate.id ? `#${candidate.id}` : ''}${candidate.classList.length ? `.${Array.from(candidate.classList).join('.')}` : ''}`,
            left: Math.round(bounds.left),
            right: Math.round(bounds.right),
            width: Math.round(bounds.width),
          };
        })
        .filter((candidate) => candidate.left < -1 || candidate.right > viewportWidth + 1)
        .slice(0, 12);
      return {
        left: rect.left,
        right: rect.right,
        renderedRatio: rect.width / rect.height,
        intrinsicRatio: element.naturalWidth / element.naturalHeight,
        objectFit: style.objectFit,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth,
        overflowing,
      };
    });
    if (viewport.width === 390 || viewport.width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`article-${viewport.width}.png`), fullPage: true });
    }
    expect(measurements.objectFit).toBe('contain');
    expect(measurements.left).toBeGreaterThanOrEqual(0);
    expect(measurements.right).toBeLessThanOrEqual(viewport.width + 1);
    expect(measurements.documentWidth, JSON.stringify(measurements.overflowing)).toBeLessThanOrEqual(measurements.viewportWidth);
    expect(Math.abs(measurements.renderedRatio - measurements.intrinsicRatio)).toBeLessThan(0.02);
  });
}
