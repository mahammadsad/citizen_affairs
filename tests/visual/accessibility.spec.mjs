import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage has no automatically detectable serious accessibility violations', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
