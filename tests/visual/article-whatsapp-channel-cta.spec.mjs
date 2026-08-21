import { expect, test } from '@playwright/test';

const cases = [
  {
    locale: 'en',
    path: '/articles/find-government-schemes-with-myscheme/',
    channel: 'https://whatsapp.com/channel/0029VbEBWWNHwXb2suA0tf0r',
    button: 'Follow English Channel',
  },
  {
    locale: 'bn',
    path: '/bn/articles/find-government-schemes-with-myscheme/',
    channel: 'https://whatsapp.com/channel/0029Vb8NQAX9cDDTfaEDwk3r',
    button: 'বাংলা চ্যানেল ফলো করুন',
  },
  {
    locale: 'hi',
    path: '/hi/articles/find-official-government-websites-and-services/',
    channel: 'https://whatsapp.com/channel/0029VbDMfavLikgC8qYfCM2t',
    button: 'हिंदी चैनल फॉलो करें',
  },
];

for (const entry of cases) {
  test(`${entry.locale} article shows the correct WhatsApp Channel CTA on mobile`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(entry.path, { waitUntil: 'networkidle' });

    const cta = page.locator('[data-whatsapp-channel-cta]');
    const link = cta.locator('[data-whatsapp-channel-link]');

    await expect(cta).toHaveAttribute('data-locale', entry.locale);
    await expect(link).toHaveAttribute('href', entry.channel);
    await expect(link).toContainText(entry.button);
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();

    const metrics = await cta.evaluate((element) => {
      const button = element.querySelector('[data-whatsapp-channel-link]');
      if (!(button instanceof HTMLElement)) throw new Error('WhatsApp CTA button missing');
      const rect = element.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        buttonHeight: buttonRect.height,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    });

    expect(metrics.left).toBeGreaterThanOrEqual(0);
    expect(metrics.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);

    await page.screenshot({
      path: testInfo.outputPath(`article-whatsapp-${entry.locale}-390.png`),
      fullPage: false,
    });
  });
}
