import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import { normalizePrivateObjectPath, promoteImageBufferForTest } from '../scripts/lib/publication-image.mjs';

test('private object paths are normalized without allowing traversal', () => {
  assert.equal(normalizePrivateObjectPath('editorial-assets/articles/test.png'), 'articles/test.png');
  assert.equal(normalizePrivateObjectPath('/articles/test.png'), 'articles/test.png');
  assert.throws(() => normalizePrivateObjectPath('../private.png'), /invalid storage path/);
});

test('approved image promotion creates deterministic responsive WebP and AVIF assets', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'citizen-affairs-image-'));
  const buffer = await sharp({
    create: { width: 960, height: 540, channels: 3, background: { r: 11, g: 29, b: 58 } },
  }).png().toBuffer();
  const first = await promoteImageBufferForTest({ buffer, root, language: 'en', slug: 'safe-test-image' });
  const second = await promoteImageBufferForTest({ buffer, root, language: 'en', slug: 'safe-test-image' });

  assert.deepEqual(first, second);
  assert.equal(first.featuredImageWidth, 1200);
  assert.equal(first.featuredImageHeight, 675);
  assert.match(first.featuredImageSrcSet, /480w.*768w.*1200w/);
  assert.match(first.featuredImageAvifSrcSet, /480w.*768w.*1200w/);

  const webp = await readFile(path.join(root, 'public', first.featuredImage));
  const avif = await readFile(path.join(root, 'public', first.featuredImageAvif));
  assert.ok(webp.length < 350 * 1024);
  assert.ok(avif.length < 250 * 1024);
  assert.deepEqual(await sharp(webp).metadata().then(({ width, height }) => ({ width, height })), { width: 1200, height: 675 });
});
