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
  test(`featured image and article table stay complete at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto(articlePath, { waitUntil: 'networkidle' });
    const image = page.locator('.article-hero-image');
    const table = page.locator('.article-content table').first();
    await expect(image).toBeVisible();
    await expect(table).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/article-reading-mode/);
    await expect(page.locator('.portal-brand img')).toHaveCount(1);
    await expect(page.locator('.portal-language > summary')).toBeVisible();
    await expect(page.locator('.category-nav-shell')).toBeHidden();
    await expect(page.locator('.portal-mobile-bottom')).toBeHidden();

    if (viewport.width <= 680) {
      await expect(page.locator('.portal-mobile-bottom a[href*="search"]')).toBeHidden();
      await expect(page.locator('.portal-search-action')).toBeHidden();
    } else {
      await expect(page.locator('.portal-search-action')).toBeVisible();
    }

    if (viewport.width < 1100) {
      await expect(page.locator('.portal-mobile-menu > summary')).toBeVisible();
    } else {
      await expect(page.locator('.portal-desktop-nav')).toBeVisible();
      await expect(page.locator('.portal-mobile-menu')).toBeHidden();
    }

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

    const tableMeasurements = await table.evaluate((element) => {
      const content = element.closest('.article-content');
      if (!content) throw new Error('Article table is not inside the article content column.');
      const tableRect = element.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const cellOverflow = Array.from(element.querySelectorAll('th, td'))
        .filter((cell) => cell.scrollWidth > cell.clientWidth + 2)
        .map((cell) => ({
          text: cell.textContent?.trim().slice(0, 80),
          clientWidth: cell.clientWidth,
          scrollWidth: cell.scrollWidth,
        }));
      return {
        tableLeft: tableRect.left,
        tableRight: tableRect.right,
        contentLeft: contentRect.left,
        contentRight: contentRect.right,
        leftInset: tableRect.left - contentRect.left,
        rightInset: contentRect.right - tableRect.right,
        leftViewportGutter: tableRect.left,
        rightViewportGutter: viewportWidth - tableRect.right,
        viewportWidth,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        cellOverflow,
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

    expect(tableMeasurements.tableLeft).toBeGreaterThanOrEqual(0);
    expect(tableMeasurements.tableRight).toBeLessThanOrEqual(tableMeasurements.viewportWidth + 1);
    if (viewport.width <= 680) {
      expect(tableMeasurements.leftViewportGutter).toBeGreaterThanOrEqual(12);
      expect(tableMeasurements.rightViewportGutter).toBeGreaterThanOrEqual(12);
      expect(
        Math.abs(tableMeasurements.leftViewportGutter - tableMeasurements.rightViewportGutter),
        JSON.stringify(tableMeasurements),
      ).toBeLessThanOrEqual(2);
    } else {
      expect(tableMeasurements.tableLeft).toBeGreaterThanOrEqual(tableMeasurements.contentLeft - 1);
      expect(tableMeasurements.tableRight).toBeLessThanOrEqual(tableMeasurements.contentRight + 1);
      expect(Math.abs(tableMeasurements.leftInset - tableMeasurements.rightInset)).toBeLessThanOrEqual(2);
    }
    expect(tableMeasurements.scrollWidth).toBeLessThanOrEqual(tableMeasurements.clientWidth + 2);
    expect(tableMeasurements.cellOverflow).toEqual([]);
  });
}
