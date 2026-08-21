import { expect, test } from '@playwright/test';

test('phone homepage keeps editorial sections single-column and Latest unboxed', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const grids = page.locator('.section-story-grid');
  expect(await grids.count()).toBeGreaterThan(0);

  const gridColumns = await grids.evaluateAll((elements) =>
    elements.map((element) => getComputedStyle(element).gridTemplateColumns.trim()),
  );
  for (const columns of gridColumns) {
    expect(columns.split(/\s+/)).toHaveLength(1);
  }

  const latestTitle = page.locator('.latest-rail > h2');
  const latestList = page.locator('.latest-rail-list');
  await expect(latestTitle).toBeVisible();
  await expect(latestList).toBeVisible();

  const borders = await page.evaluate(() => {
    const title = document.querySelector('.latest-rail > h2');
    const list = document.querySelector('.latest-rail-list');
    if (!(title instanceof HTMLElement) || !(list instanceof HTMLElement)) {
      throw new Error('Latest rail missing');
    }
    const titleStyle = getComputedStyle(title);
    const listStyle = getComputedStyle(list);
    return {
      titleLeft: titleStyle.borderLeftWidth,
      titleRight: titleStyle.borderRightWidth,
      listLeft: listStyle.borderLeftWidth,
      listRight: listStyle.borderRightWidth,
    };
  });

  expect(borders).toEqual({ titleLeft: '0px', titleRight: '0px', listLeft: '0px', listRight: '0px' });
  await page.screenshot({ path: testInfo.outputPath('production-polish-home-390.png'), fullPage: true });
});

test('article keeps one visible publication-date row while retaining the editorial byline', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const articleHref = await page.locator('.lead-story').getAttribute('href');
  expect(articleHref).toBeTruthy();
  await page.goto(articleHref, { waitUntil: 'networkidle' });

  const topMeta = page.locator('.article-meta-row');
  const publicationMeta = page.locator('.article-publication-meta');
  const publicationByline = publicationMeta.locator('.article-publication-byline');
  const duplicateDates = publicationMeta.locator(':scope > span:not(.article-publication-byline)');

  await expect(topMeta).toBeVisible();
  await expect(publicationMeta).toBeVisible();
  await expect(publicationByline).toBeVisible();
  expect(await duplicateDates.count()).toBeGreaterThan(0);
  for (const date of await duplicateDates.all()) {
    await expect(date).toBeHidden();
  }

  await page.screenshot({ path: testInfo.outputPath('production-polish-article-390.png'), fullPage: true });
});
