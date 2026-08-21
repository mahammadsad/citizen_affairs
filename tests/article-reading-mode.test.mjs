import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');

test('article detail routes opt into distraction-free reading mode', () => {
  assert.match(mainLayout, /Astro\.url\.pathname\.split\('\/'\)\.filter\(Boolean\)/);
  assert.match(mainLayout, /routeSegments\.indexOf\('articles'\)/);
  assert.match(mainLayout, /routeSegments\.length > articleSegmentIndex \+ 1/);
  assert.match(mainLayout, /article-reading-mode/);
  assert.match(mainLayout, /<BaseLayout[\s\S]*\{bodyClass\}/);
});

test('reading mode removes redundant article chrome while preserving safe-area spacing', () => {
  assert.match(mainLayout, /body\.article-reading-mode \.article-labels > span/);
  assert.match(mainLayout, /body\.article-reading-mode \.reading-time/);
  assert.match(mainLayout, /body\.article-reading-mode #copyLink/);
  assert.match(mainLayout, /body\.article-reading-mode \.verification-strip/);
  assert.match(
    mainLayout,
    /body\.article-reading-mode\)[\s\S]*padding-bottom: max\(18px, env\(safe-area-inset-bottom\)\) !important/
  );
  assert.match(baseLayout, /bodyClass\?: string/);
  assert.match(baseLayout, /<body id="top" class=\{bodyClass\}>/);
});