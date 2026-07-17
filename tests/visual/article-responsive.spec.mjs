import { expect, test } from '@playwright/test';

const articlePath = '/bn/articles/india-major-welfare-schemes-official-guide/';
const viewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
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

    const measurements = await image.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        left: rect.left,
        right: rect.right,
        renderedRatio: rect.width / rect.height,
        intrinsicRatio: element.naturalWidth / element.naturalHeight,
        objectFit: style.objectFit,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(measurements.objectFit).toBe('contain');
    expect(measurements.left).toBeGreaterThanOrEqual(0);
    expect(measurements.right).toBeLessThanOrEqual(viewport.width + 1);
    expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth);
    expect(Math.abs(measurements.renderedRatio - measurements.intrinsicRatio)).toBeLessThan(0.02);

    if (viewport.width === 390 || viewport.width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`article-${viewport.width}.png`), fullPage: true });
    }
  });
}
