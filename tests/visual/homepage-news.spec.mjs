import { expect, test } from '@playwright/test';

const headerLogoSelector = '.portal-navbar .portal-brand > .portal-brand-logo';

test('mobile homepage is image-led and the brand does not collide at 390px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const logo = page.locator(headerLogoSelector);
  const actions = page.locator('.portal-header-actions');
  const lead = page.locator('.lead-story');
  const leadPicture = lead.locator('[data-story-image="lead"]');
  const leadImage = leadPicture.locator('img');
  const leadHeading = lead.locator('h2');

  await expect(logo).toBeVisible();
  await expect(page.locator('.news-hero')).toBeVisible();
  await expect(lead).toBeVisible();
  await expect(leadPicture).toBeVisible();
  await expect(leadImage).toBeVisible();
  await expect(leadImage).toHaveAttribute('loading', 'eager');
  await expect(leadImage).toHaveAttribute('fetchpriority', 'high');
  await expect(leadImage).toHaveAttribute('width', '1200');
  await expect(leadImage).toHaveAttribute('height', '675');
  await expect(leadImage).toHaveAttribute('alt', /.+/);
  await expect(page.locator('.trending-section')).toBeVisible();
  await expect(page.locator('.section-news-block')).toHaveCount(7);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  await expect(page.locator('.portal-mobile-bottom a[href*="search"]')).toBeVisible();

  const measurements = await page.evaluate((selector) => {
    const logo = document.querySelector(selector);
    const actions = document.querySelector('.portal-header-actions');
    const image = document.querySelector('.lead-story [data-story-image="lead"] img');
    const heading = document.querySelector('.lead-story h2');
    if (
      !(logo instanceof HTMLElement) ||
      !(actions instanceof HTMLElement) ||
      !(image instanceof HTMLImageElement) ||
      !(heading instanceof HTMLElement)
    ) {
      throw new Error('Homepage visual elements missing');
    }
    const logoRect = logo.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return {
      logoLeft: logoRect.left,
      logoRight: logoRect.right,
      logoWidth: logoRect.width,
      actionsLeft: actionsRect.left,
      imageTop: imageRect.top,
      imageBottom: imageRect.bottom,
      imageWidth: imageRect.width,
      imageHeight: imageRect.height,
      imageComplete: image.complete,
      imageNaturalWidth: image.naturalWidth,
      headingTop: headingRect.top,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  }, headerLogoSelector);

  expect(measurements.logoLeft).toBeGreaterThanOrEqual(0);
  expect(measurements.logoWidth).toBeGreaterThanOrEqual(184);
  expect(measurements.logoRight).toBeLessThanOrEqual(measurements.actionsLeft + 1);
  expect(measurements.imageComplete).toBe(true);
  expect(measurements.imageNaturalWidth).toBeGreaterThan(0);
  expect(measurements.imageBottom).toBeLessThanOrEqual(measurements.headingTop);
  expect(measurements.imageWidth / measurements.imageHeight).toBeCloseTo(16 / 9, 1);
  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth);

  await page.screenshot({ path: testInfo.outputPath('article-homepage-390.png'), fullPage: true });
});

test('mobile navigation covers the viewport and includes menu search', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const trigger = page.locator('.portal-mobile-menu > summary');
  await trigger.click();

  const panel = page.locator('.portal-mobile-panel');
  const search = page.locator('.portal-mobile-menu-search');
  const searchInput = search.locator('input[name="q"]');
  const closeButton = page.locator('.portal-mobile-close');

  await expect(page.locator('.portal-mobile-menu')).toHaveAttribute('open', '');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('role', 'dialog');
  await expect(panel).toHaveAttribute('aria-modal', 'true');
  await expect(search).toBeVisible();
  await expect(searchInput).toBeFocused();
  await expect(closeButton).toBeVisible();
  await expect(page.locator('.portal-mobile-brand-logo')).toBeVisible();
  await expect(page.locator('.portal-mobile-home')).toBeVisible();
  await expect(page.locator('.portal-mobile-bottom')).toBeHidden();
  await expect(page.locator('body')).toHaveClass(/portal-menu-open/);

  const geometry = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  expect(Math.abs(geometry.top)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.right - geometry.viewportWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.bottom - geometry.viewportHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.width - geometry.viewportWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.height - geometry.viewportHeight)).toBeLessThanOrEqual(1);

  await page.screenshot({ path: testInfo.outputPath('mobile-fullscreen-navigation.png'), fullPage: false });

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/portal-menu-open/);
  await expect(trigger).toBeFocused();
});

test('very narrow homepage stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('.portal-theme-toggle')).toBeHidden();
  await expect(page.locator(headerLogoSelector)).toBeVisible();
  await expect(page.locator('.lead-story [data-story-image="lead"] img')).toBeVisible();

  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
});
