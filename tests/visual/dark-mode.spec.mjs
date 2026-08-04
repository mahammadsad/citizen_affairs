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

test('Bengali mobile dark mode keeps the renovated citizen portal readable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.portal-hero')).toBeVisible();
  await expect(page.locator('.portal-brand-logo')).toHaveAttribute('src', /citizen-affairs-horizontal-dark\.svg$/);
  await expect(page.locator('.footer-brand-logo')).toHaveAttribute('src', /citizen-affairs-full-dark\.svg$/);
  await expect(page.locator('.portal-mobile-bottom')).toBeVisible();

  const colours = await page.evaluate(() => {
    const header = document.querySelector('.portal-header');
    const navbar = document.querySelector('.portal-navbar-inner');
    const headerBrand = document.querySelector('.portal-brand');
    const headerIcon = document.querySelector('.portal-theme-toggle');
    const search = document.querySelector('.portal-search');
    const input = document.querySelector('.portal-search input');
    const quickLink = document.querySelector('.portal-action-grid a');
    const bottomNav = document.querySelector('.portal-mobile-bottom');
    const bottomNavLink = document.querySelector('.portal-mobile-bottom a');
    const footerBrand = document.querySelector('.site-footer .footer-brand');
    if (
      !header ||
      !navbar ||
      !headerBrand ||
      !headerIcon ||
      !search ||
      !input ||
      !quickLink ||
      !bottomNav ||
      !bottomNavLink ||
      !footerBrand
    ) {
      throw new Error('Renovated dark-mode selectors are missing');
    }

    return {
      headerBackground: getComputedStyle(header).backgroundColor,
      headerHeight: navbar.getBoundingClientRect().height,
      headerBrandBackground: getComputedStyle(headerBrand).backgroundColor,
      headerIcon: getComputedStyle(headerIcon).color,
      searchBackground: getComputedStyle(search).backgroundColor,
      inputText: getComputedStyle(input).color,
      placeholder: getComputedStyle(input, '::placeholder').color,
      quickBackground: getComputedStyle(quickLink).backgroundColor,
      quickText: getComputedStyle(quickLink).color,
      bottomBackground: getComputedStyle(bottomNav).backgroundColor,
      bottomText: getComputedStyle(bottomNavLink).color,
      footerBrandBackground: getComputedStyle(footerBrand).backgroundColor,
    };
  });

  expect(colours.headerHeight).toBeLessThanOrEqual(68);
  expect(colours.headerBrandBackground).toBe('rgba(0, 0, 0, 0)');
  expect(colours.footerBrandBackground).toBe('rgba(0, 0, 0, 0)');
  expect(contrast(colours.headerIcon, colours.headerBackground)).toBeGreaterThanOrEqual(3);
  expect(contrast(colours.inputText, colours.searchBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.placeholder, colours.searchBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.quickText, colours.quickBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.bottomText, colours.bottomBackground)).toBeGreaterThanOrEqual(3);

  let axe = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-home-390.png'), fullPage: true });

  await page.locator('.portal-mobile-menu > summary').click();
  const panel = page.locator('.portal-mobile-panel');
  await expect(panel).toBeVisible();

  const panelColours = await page.evaluate(() => {
    const panel = document.querySelector('.portal-mobile-panel');
    const link = document.querySelector('.portal-mobile-panel nav a');
    const heading = document.querySelector('.portal-mobile-head strong');
    if (!panel || !link || !heading) throw new Error('Renovated mobile menu selectors are missing');
    return {
      panelBackground: getComputedStyle(panel).backgroundColor,
      linkText: getComputedStyle(link).color,
      headingText: getComputedStyle(heading).color,
    };
  });

  expect(contrast(panelColours.linkText, panelColours.panelBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(panelColours.headingText, panelColours.panelBackground)).toBeGreaterThanOrEqual(4.5);

  axe = await new AxeBuilder({ page }).include('.portal-mobile-panel').analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-menu-390.png'), fullPage: true });
});
