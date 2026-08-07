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
  const publishedSections = page.locator('.news-section-block');

  await expect(logo).toBeVisible();
  await expect(page.locator('.top-news')).toBeVisible();
  await expect(lead).toBeVisible();
  await expect(leadPicture).toBeVisible();
  await expect(leadImage).toBeVisible();
  await expect(leadImage).toHaveAttribute('loading', 'eager');
  await expect(leadImage).toHaveAttribute('fetchpriority', 'high');
  await expect(leadImage).toHaveAttribute('width', '1200');
  await expect(leadImage).toHaveAttribute('height', '675');
  await expect(leadImage).toHaveAttribute('alt', /.+/);
  await expect(page.locator('.latest-rail')).toBeVisible();
  expect(await publishedSections.count()).toBeGreaterThan(0);
  await expect(page.locator('.trending-section')).toHaveCount(0);
  await expect(page.locator('.section-empty')).toHaveCount(0);
  await expect(page.locator('.portal-search')).toHaveCount(0);
  await expect(page.locator('.portal-mobile-bottom')).toBeHidden();

  const measurements = await page.evaluate((selector) => {
    const logo = document.querySelector(selector);
    const actions = document.querySelector('.portal-header-actions');
    const navbar = document.querySelector('.portal-navbar-inner');
    const categoryNav = document.querySelector('.category-nav');
    const image = document.querySelector('.lead-story [data-story-image="lead"] img');
    const heading = document.querySelector('.lead-story h2');
    if (
      !(logo instanceof HTMLElement) ||
      !(actions instanceof HTMLElement) ||
      !(navbar instanceof HTMLElement) ||
      !(categoryNav instanceof HTMLElement) ||
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
      headerHeight: navbar.getBoundingClientRect().height,
      categoryHeight: categoryNav.getBoundingClientRect().height,
      bodyPaddingBottom: Number.parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
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
  expect(measurements.headerHeight).toBeLessThanOrEqual(66);
  expect(measurements.categoryHeight).toBeLessThanOrEqual(44);
  expect(measurements.bodyPaddingBottom).toBeLessThan(20);
  expect(measurements.imageComplete).toBe(true);
  expect(measurements.imageNaturalWidth).toBeGreaterThan(0);
  expect(measurements.imageBottom).toBeLessThanOrEqual(measurements.headingTop);
  expect(measurements.imageWidth / measurements.imageHeight).toBeCloseTo(16 / 9, 1);
  expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewportWidth);

  await page.screenshot({ path: testInfo.outputPath('article-homepage-390.png'), fullPage: true });
});

test('mobile navigation expands below the header and pushes content down', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const trigger = page.locator('.portal-mobile-trigger');
  const panel = page.locator('.portal-mobile-panel');
  const content = page.locator('.top-news');
  const before = await content.boundingBox();

  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('aria-hidden', 'false');
  await expect(panel.locator('nav a').first()).toBeVisible();
  await expect(panel.locator('.portal-mobile-utility-link[href*="/search"]')).toBeVisible();
  await expect(panel.locator('.portal-mobile-utility-link[href*="/saved"]')).toBeVisible();
  await expect(page.locator('.portal-mobile-social-link')).toHaveCount(4);
  await expect(page.locator('.portal-mobile-bottom')).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/portal-menu-open/);

  const after = await content.boundingBox();
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (before && after) expect(after.y - before.y).toBeGreaterThan(100);

  const geometry = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    };
  });

  expect(geometry.top).toBeGreaterThan(0);
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);

  await page.screenshot({ path: testInfo.outputPath('mobile-expanding-navigation.png'), fullPage: false });

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('very narrow homepage stays within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  await expect(page.locator('.portal-theme-toggle')).toBeHidden();
  await expect(page.locator(headerLogoSelector)).toBeVisible();
  await expect(page.locator('.lead-story [data-story-image="lead"] img')).toBeVisible();
  await expect(page.locator('.portal-mobile-bottom')).toBeHidden();

  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
});
