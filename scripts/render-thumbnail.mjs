import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { thumbnailHtml } from './lib/thumbnail-template.mjs';

const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
const title = arg('--title');
const output = arg('--output');
if (!title || !output) throw new Error('--title and --output are required');
if (!output.endsWith('.webp')) throw new Error('--output must use a .webp extension');
const resolvedOutput = path.resolve(output);
const allowedRoot = path.resolve(process.cwd(), 'public', 'uploads');
if (!resolvedOutput.startsWith(`${allowedRoot}${path.sep}`)) throw new Error('Thumbnail output must be inside public/uploads');

const monogram = await readFile(path.join(process.cwd(), 'public', 'assets', 'brand', 'citizen-affairs-monogram.png'));
const html = thumbnailHtml({
  title,
  organisation: arg('--organisation'),
  highlight: arg('--highlight'),
  badge: arg('--badge') || 'OFFICIAL UPDATE',
  language: arg('--language') || 'en',
  monogramDataUrl: `data:image/png;base64,${monogram.toString('base64')}`,
});

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const screenshot = await page.screenshot({ type: 'png' });
  let webp;
  for (const quality of [84, 78, 72, 66]) {
    webp = await sharp(screenshot).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (webp.length <= 350 * 1024) break;
  }
  if (!webp || webp.length > 350 * 1024) throw new Error('Rendered thumbnail exceeds 350 KB');
  await mkdir(path.dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, webp);

  const avifOutput = resolvedOutput.replace(/\.webp$/i, '.avif');
  const avif = await sharp(screenshot).avif({ quality: 50, effort: 5, chromaSubsampling: '4:2:0' }).toBuffer();
  if (avif.length <= 250 * 1024) await writeFile(avifOutput, avif);
  process.stdout.write(`${resolvedOutput}\n`);
} finally {
  await browser.close();
}
