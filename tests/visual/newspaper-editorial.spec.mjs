import { expect, test } from '@playwright/test';

test('Bengali homepage uses centered newspaper masthead and self-hosted editorial hierarchy on desktop', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const brand = page.locator('.portal-brand');
  const nav = page.locator('.portal-desktop-nav');
  await expect(brand).toBeVisible();
  await expect(nav).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('article-newspaper-home-bn-1440.png'), fullPage: true });

  const metrics = await page.evaluate(() => {
    const masthead = document.querySelector('.portal-brand');
    const sectionNav = document.querySelector('.portal-desktop-nav');
    const header = document.querySelector('.portal-navbar-inner');
    const headline = document.querySelector('.lead-story h2');
    const main = document.querySelector('#main-content');
    const editorialAccent = document.querySelector('main .section-title-row a, main .news-section-block > header a, main .lead-story .story-kicker strong');
    if (!(masthead instanceof HTMLElement) || !(sectionNav instanceof HTMLElement) || !(header instanceof HTMLElement) || !(headline instanceof HTMLElement) || !(main instanceof HTMLElement) || !(editorialAccent instanceof HTMLElement)) {
      throw new Error('newspaper editorial elements missing');
    }
    const mastheadRect = masthead.getBoundingClientRect();
    const navRect = sectionNav.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const headlineStyle = getComputedStyle(headline);
    return {
      mastheadCenter: mastheadRect.left + mastheadRect.width / 2,
      viewportCenter: innerWidth / 2,
      navTop: navRect.top,
      mastheadBottom: mastheadRect.bottom,
      headerHeight: headerRect.height,
      headlineFont: headlineStyle.fontFamily,
      accentColor: getComputedStyle(editorialAccent).color,
      primaryToken: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      mainBackground: getComputedStyle(main).backgroundColor,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(Math.abs(metrics.mastheadCenter - metrics.viewportCenter)).toBeLessThan(14);
  expect(metrics.navTop).toBeGreaterThanOrEqual(metrics.mastheadBottom - 2);
  expect(metrics.headerHeight).toBeGreaterThanOrEqual(112);
  expect(metrics.headlineFont).toContain('Noto Sans Bengali Variable');
  expect(metrics.primaryToken).toBe('#0a5aa6');
  expect(metrics.accentColor).toBe('rgb(10, 90, 166)');
  expect(metrics.bodyBackground).toBe('rgb(255, 255, 255)');
  expect(metrics.mainBackground).toBe('rgb(255, 255, 255)');
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
});

test('Bengali mobile homepage and article keep readable newspaper rhythm without overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const homeMetrics = await page.evaluate(() => ({
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(homeMetrics.bodyBackground).toBe('rgb(255, 255, 255)');
  expect(homeMetrics.documentWidth).toBeLessThanOrEqual(homeMetrics.viewportWidth);
  await page.screenshot({ path: testInfo.outputPath('article-newspaper-home-bn-390.png'), fullPage: true });

  const articleLink = page.locator('a.lead-story[href*="/bn/articles/"]').first();
  await expect(articleLink).toBeVisible();
  await articleLink.click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.article-header h1')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('article-newspaper-article-bn-390.png'), fullPage: true });

  const articleMetrics = await page.evaluate(() => {
    const title = document.querySelector('.article-header h1');
    const content = document.querySelector('.article-content');
    const article = document.querySelector('article[data-article]');
    const visibleArticleLink = document.querySelector('article[data-article] .article-content a[href], article[data-article] .source-line a[href], article[data-article] .article-labels a[href]');
    const hotfixStylesheet = document.querySelector('link[href*="article-link-brand-blue-v2.css"]');
    if (!(title instanceof HTMLElement) || !(content instanceof HTMLElement) || !(article instanceof HTMLElement) || !(visibleArticleLink instanceof HTMLElement) || !(hotfixStylesheet instanceof HTMLLinkElement)) {
      throw new Error('article typography or brand-link stylesheet missing');
    }
    const contentStyle = getComputedStyle(content);
    return {
      titleFont: getComputedStyle(title).fontFamily,
      contentFont: contentStyle.fontFamily,
      articlePrimary: getComputedStyle(article).getPropertyValue('--color-primary').trim(),
      articleLinkColor: getComputedStyle(visibleArticleLink).color,
      articleBackground: getComputedStyle(article).backgroundColor,
      lineHeight: Number.parseFloat(contentStyle.lineHeight),
      fontSize: Number.parseFloat(contentStyle.fontSize),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(articleMetrics.titleFont).toContain('Noto Sans Bengali Variable');
  expect(articleMetrics.contentFont).toContain('Noto Sans Bengali Variable');
  expect(articleMetrics.articlePrimary).toBe('#0a5aa6');
  expect(articleMetrics.articleLinkColor).toBe('rgb(10, 90, 166)');
  expect(articleMetrics.articleBackground).toBe('rgb(255, 255, 255)');
  expect(articleMetrics.lineHeight / articleMetrics.fontSize).toBeGreaterThan(1.75);
  expect(articleMetrics.documentWidth).toBeLessThanOrEqual(articleMetrics.viewportWidth);
});
