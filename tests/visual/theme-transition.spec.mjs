import { expect, test } from '@playwright/test';
import sharp from 'sharp';

const pixelLuminance = (data, width, channels, x, y) => {
  const offset = (y * width + x) * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  return (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);
};

const pauseThemeWipeHalfway = async (page) => {
  await page.waitForFunction(() =>
    document.documentElement.getAnimations({ subtree: true }).some(
      (animation) => animation.effect?.pseudoElement === '::view-transition-new(root)'
    )
  );

  return page.evaluate(() => {
    const animation = document.documentElement.getAnimations({ subtree: true }).find(
      (candidate) => candidate.effect?.pseudoElement === '::view-transition-new(root)'
    );
    if (!animation) throw new Error('Theme wipe animation was not found');
    const timing = animation.effect.getTiming();
    animation.pause();
    animation.currentTime = 150;
    return { duration: timing.duration, easing: timing.easing };
  });
};

const captureEdgeLuminance = async (page) => {
  const screenshot = await page.screenshot();
  const { data, info } = await sharp(screenshot).raw().toBuffer({ resolveWithObject: true });
  return {
    top: pixelLuminance(data, info.width, info.channels, 5, 110),
    bottom: pixelLuminance(data, info.width, info.channels, 5, info.height - 90),
  };
};

test('theme toggle uses a 300ms top-to-bottom reference wipe in both directions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/bn/', { waitUntil: 'networkidle' });

  const root = page.locator('html');
  const toggle = page.locator('.portal-theme-toggle');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(toggle).toBeVisible();

  await toggle.click();
  const darkTiming = await pauseThemeWipeHalfway(page);
  expect(darkTiming.duration).toBe(300);
  expect(darkTiming.easing.replaceAll(' ', '')).toBe('cubic-bezier(0.4,0,0.2,1)');

  const darkHalfway = await captureEdgeLuminance(page);
  expect(darkHalfway.top).toBeLessThan(100);
  expect(darkHalfway.bottom).toBeGreaterThan(165);

  await page.evaluate(() => {
    document.documentElement.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
  });
  await expect(root).toHaveAttribute('data-theme', 'dark');

  await toggle.click();
  const lightTiming = await pauseThemeWipeHalfway(page);
  expect(lightTiming.duration).toBe(300);

  const lightHalfway = await captureEdgeLuminance(page);
  expect(lightHalfway.top).toBeGreaterThan(165);
  expect(lightHalfway.bottom).toBeLessThan(100);

  await page.evaluate(() => {
    document.documentElement.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
  });
  await expect(root).toHaveAttribute('data-theme', 'light');
});
