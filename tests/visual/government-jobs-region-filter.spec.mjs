import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('State and UT filter appears only for State regional jobs', async ({ page }) => {
  await page.goto('/bn/categories/jobs/');

  const filterDetails = page.locator('[data-job-filter-details]');
  await filterDetails.locator('summary').click();

  const panel = page.locator('.jobs-filter-panel');
  const bottomNavigation = page.locator('.portal-mobile-bottom');
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

  const controlStyles = await page.evaluate(() => {
    const level = document.querySelector('[data-job-filter="level"]');
    const region = document.querySelector('[data-job-region-filter]');
    if (!(level instanceof HTMLSelectElement) || !(region instanceof HTMLSelectElement)) return null;

    const read = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        height: Math.round(box.height),
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize,
      };
    };

    return { level: read(level), region: read(region) };
  });

  expect(controlStyles).not.toBeNull();
  expect(controlStyles.region.height).toBe(controlStyles.level.height);
  expect(controlStyles.region.height).toBeGreaterThanOrEqual(48);
  expect(controlStyles.region.borderRadius).toBe(controlStyles.level.borderRadius);
  expect(controlStyles.region.backgroundColor).toBe(controlStyles.level.backgroundColor);
  expect(controlStyles.region.fontSize).toBe(controlStyles.level.fontSize);

  await page.waitForTimeout(250);
  const geometry = await page.evaluate(() => {
    const filterPanel = document.querySelector('.jobs-filter-panel');
    const bottomNav = document.querySelector('.portal-mobile-bottom');
    if (!(filterPanel instanceof HTMLElement) || !(bottomNav instanceof HTMLElement)) return null;

    const panelBox = filterPanel.getBoundingClientRect();
    const navBox = bottomNav.getBoundingClientRect();
    const panelStyle = getComputedStyle(filterPanel);
    return {
      panelBottom: Math.round(panelBox.bottom),
      navTop: Math.round(navBox.top),
      panelTop: Math.round(panelBox.top),
      viewportHeight: window.innerHeight,
      overflowY: panelStyle.overflowY,
      borderRadius: panelStyle.borderRadius,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry.panelTop).toBeGreaterThanOrEqual(0);
  expect(geometry.panelBottom).toBeLessThan(geometry.navTop);
  expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.overflowY).toBe('auto');
  expect(Number.parseFloat(geometry.borderRadius)).toBeGreaterThanOrEqual(20);

  await regionSelect.selectOption('west-bengal');
  await expect(regionSelect).toHaveValue('west-bengal');

  await levelSelect.selectOption('central');
  await expect(regionField).toBeHidden();
  await expect(regionSelect).toBeDisabled();
  await expect(regionSelect).toHaveValue('all');
});
