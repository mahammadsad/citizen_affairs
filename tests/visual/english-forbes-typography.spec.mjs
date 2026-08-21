import { expect, test } from '@playwright/test';

test('English homepage uses Merriweather for editorial headlines and sans-serif UI', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const leadHeadline = page.locator('.lead-story h2').first();
  const navigation = page.locator('.portal-desktop-nav').first();
  await expect(leadHeadline).toBeVisible();
  await expect(navigation).toBeVisible();

  const metrics = await page.evaluate(() => {
    const headline = document.querySelector('.lead-story h2');
    const nav = document.querySelector('.portal-desktop-nav');
    if (!(headline instanceof HTMLElement) || !(nav instanceof HTMLElement)) {
      throw new Error('English editorial typography targets missing');
    }
    return {
      headlineFont: getComputedStyle(headline).fontFamily,
      navFont: getComputedStyle(nav).fontFamily,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(metrics.headlineFont).toContain('Merriweather');
  expect(metrics.navFont).not.toContain('Merriweather');
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  await page.screenshot({ path: testInfo.outputPath('english-merriweather-home-1440.png'), fullPage: true });
});

test('English article uses Merriweather for headline and long-form reading at mobile width', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const articleLink = page.locator('a.lead-story[href*="/articles/"]').first();
  await expect(articleLink).toBeVisible();
  await articleLink.click();
  await page.waitForLoadState('networkidle');

  const title = page.locator('.article-header h1');
  const content = page.locator('.article-content');
  await expect(title).toBeVisible();
  await expect(content).toBeVisible();

  const metrics = await page.evaluate(() => {
    const titleEl = document.querySelector('.article-header h1');
    const contentEl = document.querySelector('.article-content');
    const actionEl = document.querySelector('.article-actions');
    if (!(titleEl instanceof HTMLElement) || !(contentEl instanceof HTMLElement) || !(actionEl instanceof HTMLElement)) {
      throw new Error('English article typography targets missing');
    }
    const contentStyle = getComputedStyle(contentEl);
    return {
      titleFont: getComputedStyle(titleEl).fontFamily,
      contentFont: contentStyle.fontFamily,
      actionFont: getComputedStyle(actionEl).fontFamily,
      lineHeight: Number.parseFloat(contentStyle.lineHeight),
      fontSize: Number.parseFloat(contentStyle.fontSize),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(metrics.titleFont).toContain('Merriweather');
  expect(metrics.contentFont).toContain('Merriweather');
  expect(metrics.actionFont).not.toContain('Merriweather');
  expect(metrics.lineHeight / metrics.fontSize).toBeGreaterThan(1.7);
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  await page.screenshot({ path: testInfo.outputPath('english-merriweather-article-390.png'), fullPage: true });
});
