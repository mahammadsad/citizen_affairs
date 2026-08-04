import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const rgb = (value) => {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) throw new Error(`Unsupported colour: ${value}`);
  return match.slice(1, 4).map(Number);
};

const luminance = ([red, green, blue]) => {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (foreground, background) => {
  const lighter = Math.max(luminance(rgb(foreground)), luminance(rgb(background)));
  const darker = Math.min(luminance(rgb(foreground)), luminance(rgb(background)));
  return (lighter + 0.05) / (darker + 0.05);
};

const seriousViolations = (results) =>
  results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));

test('Bengali mobile dark mode keeps the homepage and drawer readable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.home-hero')).toBeVisible();

  const colours = await page.evaluate(() => {
    const header = document.querySelector('.site-header');
    const headerIcon = document.querySelector('#searchToggle');
    const search = document.querySelector('.hero-search');
    const input = document.querySelector('.hero-search input');
    const quickLink = document.querySelector('.hero-quick-links a');
    if (!header || !headerIcon || !search || !input || !quickLink) throw new Error('Dark mode test selectors are missing');

    return {
      headerBackground: getComputedStyle(header).backgroundColor,
      headerIcon: getComputedStyle(headerIcon).color,
      searchBackground: getComputedStyle(search).backgroundColor,
      inputText: getComputedStyle(input).color,
      placeholder: getComputedStyle(input, '::placeholder').color,
      quickBackground: getComputedStyle(quickLink).backgroundColor,
      quickText: getComputedStyle(quickLink).color,
    };
  });

  expect(contrast(colours.headerIcon, colours.headerBackground)).toBeGreaterThanOrEqual(3);
  expect(contrast(colours.inputText, colours.searchBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.placeholder, colours.searchBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.quickText, colours.quickBackground)).toBeGreaterThanOrEqual(4.5);

  let axe = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-home-390.png'), fullPage: true });

  await page.locator('#menuToggle').click();
  const drawer = page.locator('#mobileMenu');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');

  const drawerColours = await page.evaluate(() => {
    const drawer = document.querySelector('#mobileMenu');
    const label = document.querySelector('#mobileMenu .drawer-quick-links a');
    const brand = document.querySelector('#mobileMenu .drawer-brand');
    if (!drawer || !label || !brand) throw new Error('Dark drawer test selectors are missing');
    return {
      drawerBackground: getComputedStyle(drawer).backgroundColor,
      labelText: getComputedStyle(label).color,
      brandBackground: getComputedStyle(brand).backgroundColor,
    };
  });

  expect(contrast(drawerColours.labelText, drawerColours.drawerBackground)).toBeGreaterThanOrEqual(4.5);
  expect(luminance(rgb(drawerColours.brandBackground))).toBeGreaterThan(0.9);

  axe = await new AxeBuilder({ page }).include('#mobileMenu').analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-drawer-390.png'), fullPage: true });
});
