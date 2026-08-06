import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('jobs page is task-first and State UT filters remain fully usable', async ({ page }) => {
  await page.goto('/bn/categories/jobs/');

  await expect(page.locator('.jobs-hero')).toHaveCount(0);
  await expect(page.locator('.jobs-listing-head')).toHaveCount(0);
  await expect(page.getByText('সব নাগরিক বিভাগ')).toHaveCount(0);

  const search = page.locator('[data-job-search]');
  const stageTabs = page.locator('.jobs-stage-tabs');
  const pageTitle = page.locator('#jobs-page-title');
  const resultCount = page.locator('[data-job-result-count]');
  await expect(search).toBeVisible();
  await expect(stageTabs).toBeVisible();
  await expect(pageTitle).toBeVisible();

  const taskOrder = await page.evaluate(() => {
    const search = document.querySelector('[data-job-search]');
    const stages = document.querySelector('.jobs-stage-tabs');
    const title = document.querySelector('#jobs-page-title');
    if (!(search instanceof HTMLElement) || !(stages instanceof HTMLElement) || !(title instanceof HTMLElement)) return null;

    return {
      searchTop: Math.round(search.getBoundingClientRect().top),
      stagesTop: Math.round(stages.getBoundingClientRect().top),
      titleTop: Math.round(title.getBoundingClientRect().top),
      titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
    };
  });

  expect(taskOrder).not.toBeNull();
  expect(taskOrder.searchTop).toBeLessThan(taskOrder.stagesTop);
  expect(taskOrder.stagesTop).toBeLessThan(taskOrder.titleTop);
  expect(taskOrder.titleFontSize).toBeLessThanOrEqual(16);

  const filterDetails = page.locator('[data-job-filter-details]');
  const filterTrigger = filterDetails.locator('[data-job-filter-trigger]');
  const filterIcon = filterTrigger.locator('.jobs-filter-icon');
  await expect(filterTrigger).toBeVisible();
  await expect(filterTrigger).toContainText('ফিল্টার');
  await expect(filterIcon).toBeVisible();

  const triggerGeometry = await filterTrigger.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      fontSize: Number.parseFloat(style.fontSize),
      color: style.color,
      backgroundColor: style.backgroundColor,
    };
  });

  expect(triggerGeometry.width).toBeGreaterThanOrEqual(80);
  expect(triggerGeometry.height).toBeGreaterThanOrEqual(42);
  expect(triggerGeometry.fontSize).toBeGreaterThanOrEqual(12);
  expect(triggerGeometry.color).not.toBe(triggerGeometry.backgroundColor);

  await filterTrigger.click();

  const panel = page.locator('.jobs-filter-panel');
  const bottomNavigation = page.locator('.portal-mobile-bottom');
  const levelSelect = page.locator('[data-job-filter="level"]');
  const regionField = page.locator('[data-job-region-field]');
  const regionSelect = page.locator('[data-job-region-filter]');
  const applyButton = page.locator('[data-job-apply]');
  const clearButton = panel.locator('[data-job-reset]');

  await expect(regionField).toBeHidden();
  await expect(regionSelect).toBeDisabled();
  await expect(applyButton).toBeVisible();
  await expect(clearButton).toBeVisible();
  await expect(applyButton).toContainText(/আপডেট দেখুন/);

  const actionGeometry = await page.evaluate(() => {
    const apply = document.querySelector('[data-job-apply]');
    const clear = document.querySelector('.jobs-filter-panel [data-job-reset]');
    if (!(apply instanceof HTMLButtonElement) || !(clear instanceof HTMLButtonElement)) return null;

    const applyBox = apply.getBoundingClientRect();
    const clearBox = clear.getBoundingClientRect();
    return {
      sameRow: Math.abs(applyBox.top - clearBox.top) <= 2,
      applyWidth: Math.round(applyBox.width),
      clearWidth: Math.round(clearBox.width),
      applyBackground: getComputedStyle(apply).backgroundColor,
      clearBackground: getComputedStyle(clear).backgroundColor,
    };
  });

  expect(actionGeometry).not.toBeNull();
  expect(actionGeometry.sameRow).toBe(true);
  expect(actionGeometry.applyWidth).toBeGreaterThan(actionGeometry.clearWidth);
  expect(actionGeometry.applyBackground).not.toBe(actionGeometry.clearBackground);

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
    const fields = document.querySelector('[data-job-filter-fields]');
    const actions = document.querySelector('[data-job-filter-actions]');
    if (
      !(filterPanel instanceof HTMLElement) ||
      !(bottomNav instanceof HTMLElement) ||
      !(fields instanceof HTMLElement) ||
      !(actions instanceof HTMLElement)
    ) return null;

    const panelBox = filterPanel.getBoundingClientRect();
    const navBox = bottomNav.getBoundingClientRect();
    const fieldsBox = fields.getBoundingClientRect();
    const actionsBox = actions.getBoundingClientRect();
    const panelStyle = getComputedStyle(filterPanel);
    const fieldsStyle = getComputedStyle(fields);
    return {
      panelBottom: Math.round(panelBox.bottom),
      navTop: Math.round(navBox.top),
      panelTop: Math.round(panelBox.top),
      viewportHeight: window.innerHeight,
      panelOverflowY: panelStyle.overflowY,
      fieldsOverflowY: fieldsStyle.overflowY,
      borderRadius: panelStyle.borderRadius,
      actionsInsidePanel: actionsBox.bottom <= panelBox.bottom && actionsBox.top >= panelBox.top,
      fieldsAboveActions: fieldsBox.bottom <= actionsBox.top + 1,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry.panelTop).toBeGreaterThanOrEqual(0);
  expect(geometry.panelBottom).toBeLessThan(geometry.navTop);
  expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.panelOverflowY).toBe('hidden');
  expect(geometry.fieldsOverflowY).toBe('auto');
  expect(geometry.actionsInsidePanel).toBe(true);
  expect(geometry.fieldsAboveActions).toBe(true);
  expect(Number.parseFloat(geometry.borderRadius)).toBeGreaterThanOrEqual(20);

  await regionSelect.selectOption('west-bengal');
  await expect(regionSelect).toHaveValue('west-bengal');
  await expect(applyButton).toContainText(/\d+টি আপডেট দেখুন/);

  await applyButton.click();
  await expect(filterDetails).not.toHaveAttribute('open', '');
  await expect(resultCount).toBeFocused();

  await filterTrigger.click();
  await levelSelect.selectOption('central');
  await expect(regionField).toBeHidden();
  await expect(regionSelect).toBeDisabled();
  await expect(regionSelect).toHaveValue('all');
});