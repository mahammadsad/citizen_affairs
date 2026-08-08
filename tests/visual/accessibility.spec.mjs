import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const affectedRoutes = [
  { path: '/contact/', intakePage: true },
  { path: '/careers/', intakePage: true },
  { path: '/bn/articles/india-major-welfare-schemes-official-guide/' },
  { path: '/bn/articles/check-exam-admit-card-result-officially/' },
];

for (const width of [390, 1440]) {
  for (const route of affectedRoutes) {
    test(`${route.path} has one main landmark and no detectable accessibility violations at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(route.path, { waitUntil: 'networkidle' });

      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('form[action*="formsubmit" i]')).toHaveCount(0);
      await expect(page.locator('input[type="file"]')).toHaveCount(0);
      if (route.intakePage) await expect(page.locator('form')).toHaveCount(0);

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
