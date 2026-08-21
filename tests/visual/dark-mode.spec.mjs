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

test('Bengali mobile dark mode keeps the professional news homepage readable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.portal-utility')).toHaveCount(0);
  await expect(page.locator('[data-portal-continuity]')).toHaveCount(0);
  await expect(page.locator('main .top-news')).toBeVisible();
  await expect(page.locator('.lead-story')).toBeVisible();
  await expect(page.locator('.latest-rail')).toBeVisible();
  expect(await page.locator('.news-section-block').count()).toBeGreaterThan(0);
  await expect(page.locator('.trending-section')).toHaveCount(0);
  await expect(page.locator('.section-empty')).toHaveCount(0);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  await expect(page.locator('.category-nav-shell')).toHaveCount(0);
  await expect(page.locator('.portal-navbar .portal-brand > .portal-brand-logo')).toHaveAttribute(
    'src',
    /citizen-affairs-horizontal-dark\.svg$/,
  );
  await expect(page.locator('.footer-brand-logo')).toHaveAttribute(
    'src',
    /citizen-affairs-full-tagline\.png$/,
  );
  await expect(page.locator('.portal-mobile-bottom')).toHaveCount(0);
  await expect(page.locator('.portal-header-actions > .portal-theme-toggle')).toBeHidden();

  const colours = await page.evaluate(() => {
    const header = document.querySelector('.portal-header');
    const navbar = document.querySelector('.portal-navbar-inner');
    const headerBrand = document.querySelector('.portal-brand');
    const headerLogo = document.querySelector('.portal-navbar .portal-brand > .portal-brand-logo');
    const headerIcon = document.querySelector('.portal-search-action');
    const home = document.querySelector('.news-home');
    const homeTitle = document.querySelector('.section-title-row h2');
    const lead = document.querySelector('.lead-story');
    const leadTitle = document.querySelector('.lead-story h2');
    const latest = document.querySelector('.latest-rail');
    const latestTitle = document.querySelector('.latest-rail > h2');
    const sectionTitle = document.querySelector('.news-section-block h3');
    const footerBrand = document.querySelector('.site-footer .footer-brand');
    if (
      !header || !navbar || !headerBrand || !headerLogo || !headerIcon || !home || !homeTitle ||
      !lead || !leadTitle || !latest || !latestTitle || !sectionTitle || !footerBrand
    ) {
      throw new Error('Professional news homepage dark-mode selectors are missing');
    }

    const brandRect = headerBrand.getBoundingClientRect();
    const logoRect = headerLogo.getBoundingClientRect();
    const actionsRect = document.querySelector('.portal-header-actions')?.getBoundingClientRect();
    if (!actionsRect) throw new Error('Header actions are missing');

    return {
      headerBackground: getComputedStyle(header).backgroundColor,
      headerHeight: navbar.getBoundingClientRect().height,
      headerBrandLeft: brandRect.left,
      headerLogoLeft: logoRect.left,
      headerLogoWidth: logoRect.width,
      headerLogoRight: logoRect.right,
      actionsLeft: actionsRect.left,
      headerIcon: getComputedStyle(headerIcon).color,
      homeBackground: getComputedStyle(home).backgroundColor,
      homeTitle: getComputedStyle(homeTitle).color,
      leadBackground: getComputedStyle(lead).backgroundColor,
      leadTitle: getComputedStyle(leadTitle).color,
      latestBackground: getComputedStyle(latest).backgroundColor,
      latestTitle: getComputedStyle(latestTitle).color,
      sectionTitle: getComputedStyle(sectionTitle).color,
      footerBrandBackground: getComputedStyle(footerBrand).backgroundColor,
      bodyPaddingBottom: Number.parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(colours.headerHeight).toBeLessThanOrEqual(64);
  expect(colours.headerBrandLeft).toBeLessThanOrEqual(17);
  expect(colours.headerLogoLeft).toBeGreaterThanOrEqual(colours.headerBrandLeft - 6);
  expect(colours.headerLogoWidth).toBeGreaterThanOrEqual(110);
  expect(colours.headerLogoRight).toBeLessThanOrEqual(colours.actionsLeft + 1);
  expect(colours.bodyPaddingBottom).toBeLessThan(20);
  expect(colours.documentWidth).toBeLessThanOrEqual(colours.viewportWidth);
  expect(contrast(colours.headerIcon, colours.headerBackground)).toBeGreaterThanOrEqual(3);
  expect(contrast(colours.homeTitle, colours.homeBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.leadTitle, colours.leadBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.latestTitle, colours.latestBackground)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(colours.sectionTitle, colours.homeBackground)).toBeGreaterThanOrEqual(4.5);

  let axe = await new AxeBuilder({ page }).analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-home-390.png'), fullPage: true });

  const trigger = page.locator('.portal-mobile-trigger');
  await trigger.click();
  const panel = page.locator('.portal-mobile-panel');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('aria-hidden', 'false');
  await expect(panel.locator('nav a[href*="/search"]')).toBeVisible();
  await expect(panel.locator('nav a[href*="/saved"]')).toBeVisible();
  await expect(panel.locator('.portal-menu-theme-toggle')).toBeVisible();

  const panelColours = await page.evaluate(() => {
    const panel = document.querySelector('.portal-mobile-panel');
    const link = document.querySelector('.portal-mobile-panel nav a');
    if (!panel || !link) throw new Error('Expanding mobile menu selectors are missing');
    return {
      panelBackground: getComputedStyle(panel).backgroundColor,
      linkText: getComputedStyle(link).color,
    };
  });

  expect(contrast(panelColours.linkText, panelColours.panelBackground)).toBeGreaterThanOrEqual(4.5);

  axe = await new AxeBuilder({ page }).include('.portal-mobile-panel').analyze();
  expect(seriousViolations(axe)).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('article-dark-menu-390.png'), fullPage: false });
});
