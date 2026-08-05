import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const horizontalLogo = await readFile(
  'public/assets/brand/citizen-affairs-horizontal.svg',
  'utf8',
);

test('redundant utility strip is removed from the rendered presentation', () => {
  assert.match(header, /class="portal-utility"/);
  assert.match(layout, /:global\(\.portal-utility\)[\s\S]*display: none !important/);
});

test('mobile brand is prominent and receives collision-free flex space', () => {
  assert.match(layout, /clamp\(168px, calc\(100vw - 176px\), 204px\)/);
  assert.match(layout, /max-height: 56px !important/);
  assert.match(layout, /:global\(\.portal-brand\)[\s\S]*flex: 1 1 auto !important/);
  assert.match(layout, /:global\(\.portal-header-actions\)[\s\S]*flex: 0 0 auto !important/);
  assert.match(layout, /:global\(\.portal-mobile-panel\)[\s\S]*top: 70px !important/);
  assert.doesNotMatch(layout, /width: 118px/);
});

test('brand mark uses intentional vector geometry instead of intersecting letter glyphs', () => {
  assert.match(horizontalLogo, /M69 27A43 43 0 1 0 69 105/);
  assert.match(horizontalLogo, /M78 106L101 24L126 106/);
  assert.doesNotMatch(horizontalLogo, />C<\/text>/);
  assert.doesNotMatch(horizontalLogo, />A<\/text>/);
});

test('very narrow screens preserve the brand by dropping only the theme shortcut', () => {
  assert.match(layout, /@media \(max-width: 350px\)/);
  assert.match(layout, /:global\(\.portal-theme-toggle\)[\s\S]*display: none !important/);
  assert.match(layout, /clamp\(160px, calc\(100vw - 142px\), 178px\)/);
});

test('desktop brand has a strong professional width with a tighter header', () => {
  assert.match(layout, /clamp\(196px, 20vw, 224px\)/);
  assert.match(layout, /max-height: 58px !important/);
  assert.match(layout, /min-height: 74px !important/);
});

test('the shared layout does not inject a pre-hero homepage panel', () => {
  assert.doesNotMatch(layout, /isPortalHome|PortalContinuity|portal-continuity-wrap/);
  assert.match(layout, /<main id="main-content">\s*<slot \/>/);
});
