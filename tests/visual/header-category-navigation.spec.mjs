import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

for (const route of ['/bn/careers/', '/hi/careers/']) {
  test(`language menu stays usable without duplicate category navigation on ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('[data-category-navigation]')).toHaveCount(0);
    await expect(page.locator('.portal-mobile-trigger')).toBeVisible();
    await expect(page.locator('.portal-search-action')).toBeVisible();

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
