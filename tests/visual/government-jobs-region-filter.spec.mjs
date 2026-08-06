import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const brand = JSON.parse(
  readFileSync(new URL('../../brand.config.json', import.meta.url), 'utf8')
);

test.use({ viewport: { width: 390, height: 844 } });

test('job and exam drafts remain configured but outside the public launch', async ({ page, request }) => {
  expect(brand.configuredCategoryIds).toContain('jobs');
  expect(brand.configuredCategoryIds).toContain('exams');
  expect(brand.activeCategoryIds).not.toContain('jobs');
  expect(brand.activeCategoryIds).not.toContain('exams');

  const [jobsResponse, examsResponse] = await Promise.all([
    request.get('/bn/categories/jobs/'),
    request.get('/bn/categories/exams/')
  ]);
  expect(jobsResponse.status()).toBe(404);
  expect(examsResponse.status()).toBe(404);

  await page.goto('/bn/categories/materials/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-category-navigation]')).toBeVisible();
  await expect(page.locator('a[href="/bn/categories/jobs/"]')).toHaveCount(0);
  await expect(page.locator('a[href="/bn/categories/exams/"]')).toHaveCount(0);

  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
  );
  expect(fitsViewport).toBe(true);
});
