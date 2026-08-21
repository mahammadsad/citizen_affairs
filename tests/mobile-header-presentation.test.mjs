import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const brandLogo = await readFile('src/components/BrandLogo.astro', 'utf8');
const brandConfig = JSON.parse(await readFile('brand.config.json', 'utf8'));

test('redundant utility strip is removed from markup and presentation', () => {
  assert.doesNotMatch(header, /class="portal-utility"/);
  assert.doesNotMatch(layout, /portal-utility/);
  assert.doesNotMatch(header, /portal-category-nav/);
});

test('mobile brand stays left aligned while search, language and menu remain available', () => {
  assert.match(header, /\.portal-brand \{ flex: 0 1 164px; min-width: 108px; overflow: hidden; \}/);
  assert.match(header, /\.portal-header-actions \{ display: flex; align-items: center; gap: \.1rem; margin-left: auto; \}/);
  assert.match(header, /portal-search-action/);
  assert.match(header, /portal-language/);
  assert.match(header, /portal-mobile-trigger/);
  assert.match(header, /@media \(max-width: 680px\)[\s\S]*\.portal-brand \{ flex-basis: 118px; \}/);
  assert.match(header, /@media \(max-width: 390px\)[\s\S]*\.portal-language > summary span \{ display: none; \}/);
  assert.match(header, /\.portal-mobile-panel\.is-open[\s\S]*grid-template-rows: 1fr/);
  assert.doesNotMatch(header, /\.portal-mobile-panel\s*\{[^}]*position:\s*fixed/);
});

test('dark header uses dark artwork without a white logo card', () => {
  assert.match(header, /\[data-theme="dark"\] \.portal-header \{ background: rgba\(8, 19, 33, \.97\); \}/);
  assert.doesNotMatch(header, /\.portal-brand\s*\{[^}]*background:\s*#fff/);
  assert.match(brandLogo, /dark: 'assets\/brand\/citizen-affairs-horizontal-dark\.svg'/);
});

test('header renders transparent theme-specific horizontal SVG lockups', () => {
  assert.match(header, /<BrandLogo variant="horizontal"/);
  assert.match(brandLogo, /light: 'assets\/brand\/citizen-affairs-horizontal\.svg'/);
  assert.match(brandLogo, /dark: 'assets\/brand\/citizen-affairs-horizontal-dark\.svg'/);
  assert.doesNotMatch(brandLogo, /horizontal:\s*\{[\s\S]*citizen-affairs-horizontal\.png/);
  assert.equal(brandConfig.logoHorizontal, 'assets/brand/citizen-affairs-horizontal.svg');
});

test('narrow screens preserve the brand by moving theme into the menu and compacting language', () => {
  assert.match(header, /@media \(max-width: 680px\)/);
  assert.match(header, /\.portal-header-actions > \.portal-theme-toggle \{ display: none; \}/);
  assert.match(header, /\.portal-menu-theme-toggle \{ display: grid; \}/);
  assert.match(header, /@media \(max-width: 390px\)/);
  assert.match(header, /\.portal-language > summary span \{ display: none; \}/);
});

test('desktop brand preserves the approved lockup and comfortable header height', () => {
  assert.match(header, /:global\(\.portal-brand-logo\) \{ display: block; width: 164px; max-width: 100%; max-height: 50px; object-fit: contain; \}/);
  assert.match(header, /\.portal-navbar-inner \{ display: flex; align-items: center; gap: \.7rem; min-height: 70px; \}/);
  assert.match(header, /@media \(min-width: 1280px\)[\s\S]*\.portal-desktop-nav \{ display: flex; \}/);
});

test('the shared layout does not inject a pre-hero homepage panel', () => {
  assert.doesNotMatch(layout, /isPortalHome|PortalContinuity|portal-continuity-wrap/);
  assert.match(layout, /<main id="main-content"[^>]*>\s*<slot \/>/);
});
