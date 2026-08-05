import { expect, test } from '@playwright/test';

test('mobile homepage is news-led and the brand does not collide at 390px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const logo = page.locator('.portal-brand-logo');
  const actions = page.locator('.portal-header-actions');
  await expect(logo).toBeVisible();
  await expect(page.locator('.news-hero')).toBeVisible();
  await expect(page.locator('.lead-story')).toBeVisible();
  await expect(page.locator('.trending-section')).toBeVisible();
  await expect(page.locator('.section-news-block')).toHaveCount(7);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  await expect(page.locator('.portal-mobile-bottom a[href*="search"]')).toBeVisible();

  const measurements = await page.evaluate(() => {
    const logo = document.querySelector('.portal-brand-logo');
    const actions = document.querySelector('.portal-header-actions');
    if (!(logo instanceof HTMLElement) || !(actions instanceof HTMLElement)) throw new Error('Header elements missing');
    const logoRect = logo.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    return {
      logoLeft: logoRect.left,
      logoRight: logoRect.right,
      logoWidth: logoRect.width,
      actionsLeft: actionsRect.left,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(measurements.logoLeft).toBeGreaterThanOrEqual(0);
  expect(measurements.logoWidth).toBeGreaterThanOrEqual(184);
  expect(measurements.logoRight).toBeLessThanOrEqual(measurements.actionsLeft + 1);
  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth);

  await page.screenshot({ path: testInfo.outputPath('article-homepage-390.png'), fullPage: true });
});

test('very narrow homepage stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('.portal-theme-toggle')).toBeHidden();
  await expect(page.locator('.portal-brand-logo')).toBeVisible();

  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
});
