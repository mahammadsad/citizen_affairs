import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const brandLogo = await readFile('src/components/BrandLogo.astro', 'utf8');
const brandConfig = JSON.parse(await readFile('brand.config.json', 'utf8'));
const lightHorizontalLogo = await readFile(
  'public/assets/brand/citizen-affairs-horizontal-quality-v2.svg',
  'utf8',
);
const darkHorizontalLogo = await readFile(
  'public/assets/brand/citizen-affairs-horizontal-quality-v2-dark.svg',
  'utf8',
);

test('redundant utility strip is removed from the rendered presentation', () => {
  assert.match(header, /class="portal-utility"/);
  assert.match(layout, /:global\(\.portal-utility\)[\s\S]*display: none !important/);
});

test('mobile brand is prominent, safely left aligned and collision free', () => {
  assert.match(layout, /--portal-logo-width: clamp\(168px, calc\(100vw - 176px\), 204px\)/);
  assert.match(layout, /max-height: 52px !important/);
  assert.match(layout, /padding-inline: \.75rem !important/);
  assert.match(layout, /transform: none !important/);
  assert.doesNotMatch(layout, /translateX\(/);
  assert.match(layout, /:global\(\.portal-brand\)[\s\S]*flex: 0 0 var\(--portal-logo-width\) !important/);
  assert.match(layout, /:global\(\.portal-header-actions\)[\s\S]*flex: 0 0 auto !important/);
  assert.match(layout, /:global\(\.portal-mobile-panel\)[\s\S]*top: 74px !important/);
  assert.doesNotMatch(layout, /width: 118px/);
});

test('dark header uses the dedicated dark artwork without a white logo card', () => {
  assert.match(
    layout,
    /:global\(html\[data-theme='dark'\] \.portal-header \.portal-brand\)[\s\S]*background: transparent !important/,
  );
  assert.match(layout, /box-shadow: none !important/);
  assert.doesNotMatch(layout, /background: #ffffff !important/);
  assert.match(layout, /filter: none !important/);
  assert.match(layout, /mix-blend-mode: normal !important/);
  assert.match(layout, /opacity: 1 !important/);
});

test('header renders transparent zoom-safe theme-specific horizontal SVG lockups', () => {
  assert.match(header, /<BrandLogo variant="horizontal"/);
  assert.match(
    brandLogo,
    /light: 'assets\/brand\/citizen-affairs-horizontal-quality-v2\.svg'/,
  );
  assert.match(
    brandLogo,
    /dark: 'assets\/brand\/citizen-affairs-horizontal-quality-v2-dark\.svg'/,
  );
  assert.doesNotMatch(
    brandLogo,
    /horizontal:\s*\{[\s\S]*citizen-affairs-horizontal\.png/,
  );
  assert.equal(
    brandConfig.logoHorizontal,
    'assets/brand/citizen-affairs-horizontal-quality-v2.svg',
  );
  for (const artwork of [lightHorizontalLogo, darkHorizontalLogo]) {
    assert.match(artwork, /shape-rendering="geometricPrecision"/);
    assert.match(artwork, /viewBox="0 0 395 150"/);
    assert.doesNotMatch(artwork, /<text\b|font-family=/);
    assert.ok(artwork.length < 20_000);
  }
});

test('very narrow screens preserve the brand by dropping only the theme shortcut', () => {
  assert.match(layout, /@media \(max-width: 350px\)/);
  assert.match(layout, /:global\(\.portal-theme-toggle\)[\s\S]*display: none !important/);
  assert.match(layout, /--portal-logo-width: clamp\(160px, calc\(100vw - 142px\), 178px\)/);
});

test('desktop brand preserves the approved lockup proportions', () => {
  assert.match(layout, /--portal-logo-width: clamp\(196px, 20vw, 224px\)/);
  assert.match(layout, /max-height: 56px !important/);
  assert.match(layout, /min-height: 82px !important/);
  assert.match(layout, /object-fit: contain !important/);
  assert.match(layout, /object-position: left center !important/);
  assert.match(layout, /overflow: visible !important/);
});

test('the shared layout does not inject a pre-hero homepage panel', () => {
  assert.doesNotMatch(layout, /isPortalHome|PortalContinuity|portal-continuity-wrap/);
  assert.match(layout, /<main id="main-content">\s*<slot \/>/);
});
