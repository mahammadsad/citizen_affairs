import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const brand = JSON.parse(
  readFileSync(new URL('../../brand.config.json', import.meta.url), 'utf8')
);
const expectedNavigationLinks = brand.activeCategoryIds.length + 3;

test.use({ viewport: { width: 390, height: 844 } });

for (const route of ['/bn/careers/', '/hi/careers/']) {
  test(`language menu stays above category navigation on ${route}`, async ({ page }) => {
    await page.goto(route);

    const categoryNavigation = page.locator('[data-category-navigation]');
    await expect(categoryNavigation).toBeVisible();

    const categoryLinks = categoryNavigation.locator('a');
    await expect(categoryLinks).toHaveCount(expectedNavigationLinks);
    await expect(categoryNavigation.locator('[data-category-link="jobs"]')).toHaveCount(0);
    await expect(categoryNavigation.locator('[data-category-link="exams"]')).toHaveCount(0);

    const scrollsInternally = await categoryNavigation.locator('nav').evaluate(
      (element) => element.scrollWidth > element.clientWidth
    );
    expect(scrollsInternally).toBe(true);

    await page.locator('.portal-language > summary').click();

    const languageLinks = page.locator('.portal-language > div a');
    await expect(languageLinks).toHaveCount(3);

    const languageCount = await languageLinks.count();
    for (let index = 0; index < languageCount; index += 1) {
      const link = languageLinks.nth(index);
      await expect(link).toBeVisible();

      const isTopmost = await link.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const hitTarget = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );

        return Boolean(hitTarget && (hitTarget === element || element.contains(hitTarget)));
      });

      expect(isTopmost).toBe(true);
    }

    const pageFitsViewport = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    );
    expect(pageFitsViewport).toBe(true);
  });
}
