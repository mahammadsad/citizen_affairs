import { expect, test } from '@playwright/test';

const oldBrand = /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র/i;
const inactiveCategoryLabels = [/^Exams$/i, /^Study Materials$/i, /^Notices$/i, /^Current Affairs$/i];

test('production homepage and discoverability are healthy', async ({ page, request }, testInfo) => {
  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Citizen Affairs/i);
  await expect(page.locator('header img[alt*="Citizen Affairs"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /search|খুঁজুন|खोजें/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /language|ভাষা|भाषा/i }).first()).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await expect(page.getByRole('button', { name: /menu|মেনু|मेनू/i })).toBeVisible();
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/citizenaffairs\.in\//);
  await expect(page.locator('body')).not.toContainText(oldBrand);
  for (const label of inactiveCategoryLabels) {
    await expect(page.getByText(label)).toHaveCount(0);
  }
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/i);
  if (process.env.EXPECTED_BUILD_COMMIT) {
    await expect(page.locator('meta[name="x-build-commit"]')).toHaveAttribute('content', process.env.EXPECTED_BUILD_COMMIT);
  }

  for (const path of ['/sitemap.xml', '/robots.txt']) {
    const resource = await request.get(path);
    expect(resource.status(), `${path} should be available`).toBe(200);
  }
  await page.screenshot({ path: `test-results/production-${testInfo.project.name}.png`, fullPage: true });
});

test('staff workspace is excluded from indexing', async ({ page }) => {
  await page.goto('/staff/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex,\s*nofollow/i);
});

test('published article is available when sitemap lists one', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const article = sitemap.match(/<loc>(https:\/\/citizenaffairs\.in\/(?:en|bn|hi)\/articles\/[^<]+)<\/loc>/)?.[1];
  if (!article) return;
  const response = await page.goto(article);
  expect(response?.status()).toBe(200);
  const articleSchema = page.locator('script[type="application/ld+json"]').filter({ hasText: /"@type"\s*:\s*"(?:Article|NewsArticle)"/ });
  await expect(articleSchema).toHaveCount(1);
});
