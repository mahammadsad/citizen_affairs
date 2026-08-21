import { expect, test } from '@playwright/test';

test('mobile theme control lives in the menu and changes theme without a full-screen wipe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.portal-header-actions > .portal-theme-toggle')).toBeHidden();

  await page.locator('.portal-mobile-trigger').click();
  const toggle = page.locator('.portal-menu-theme-toggle');
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect(root).toHaveAttribute('data-theme', 'dark');

  const hasRootWipe = await page.evaluate(() =>
    document.documentElement.getAnimations({ subtree: true }).some((animation) =>
      animation.effect?.pseudoElement?.startsWith('::view-transition-')
    )
  );
  expect(hasRootWipe).toBe(false);

  await toggle.click();
  await expect(root).toHaveAttribute('data-theme', 'light');
});
