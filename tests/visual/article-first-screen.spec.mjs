import { expect, test } from '@playwright/test';

const articlePath = '/articles/find-government-schemes-with-myscheme/';

test('mobile readers reach the article before secondary decision panels', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(articlePath, { waitUntil: 'networkidle' });

  const disclosure = page.locator('[data-article-decision-disclosure]');
  const firstParagraph = page.locator('.article-content > p').first();

  await expect(disclosure).toBeVisible();
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(firstParagraph).toBeVisible();

  const paragraphTop = await firstParagraph.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(paragraphTop).toBeLessThan(1000);

  await page.screenshot({ path: testInfo.outputPath('article-first-screen-390.png'), fullPage: true });
});
