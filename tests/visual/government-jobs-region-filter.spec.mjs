import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('State and UT filter appears only for State regional jobs', async ({ page }) => {
  await page.goto('/bn/categories/jobs/');

  const filterDetails = page.locator('[data-job-filter-details]');
  await filterDetails.locator('summary').click();

  const levelSelect = page.locator('[data-job-filter="level"]');
  const regionField = page.locator('[data-job-region-field]');
  const regionSelect = page.locator('[data-job-region-filter]');

  await expect(regionField).toBeHidden();
  await expect(regionSelect).toBeDisabled();

  await levelSelect.selectOption('state');
  await expect(regionField).toBeVisible();
  await expect(regionSelect).toBeEnabled();
  await expect(regionSelect.locator('option')).toHaveCount(37);
  await expect(regionSelect.locator('optgroup')).toHaveCount(2);

  await regionSelect.selectOption('west-bengal');
  await expect(regionSelect).toHaveValue('west-bengal');

  await levelSelect.selectOption('central');
  await expect(regionField).toBeHidden();
  await expect(regionSelect).toBeDisabled();
  await expect(regionSelect).toHaveValue('all');
});
