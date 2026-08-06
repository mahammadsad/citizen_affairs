import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('world-class visual system is loaded after legacy shared styles', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  const componentsIndex = layout.indexOf("import '../styles/components.css'");
  const visualIndex = layout.indexOf("import '../styles/worldclass.css'");
  assert.ok(componentsIndex >= 0);
  assert.ok(visualIndex > componentsIndex);
});

test('responsive interface uses the approved Citizen Affairs brand master', () => {
  const logo = read('src/components/BrandLogo.astro');
  for (const asset of [
    'citizen-affairs-full-tagline.png',
    'citizen-affairs-horizontal-quality-v2.svg',
    'citizen-affairs-horizontal-quality-dark-v2.svg',
    'citizen-affairs-monogram.png',
    'citizen-affairs-circular.png'
  ]) {
    assert.match(logo, new RegExp(asset.replace('.', '\\.')));
    assert.ok(readFileSync(new URL(`../public/assets/brand/${asset}`, import.meta.url)).length > 0);
  }

  for (const asset of [
    'citizen-affairs-horizontal-quality-v2.svg',
    'citizen-affairs-horizontal-quality-dark-v2.svg'
  ]) {
    const artwork = read(`public/assets/brand/${asset}`);
    assert.match(artwork, /Official Citizen Affairs horizontal brand artwork/);
    assert.match(artwork, /viewBox="0 0 744 312"/);
    assert.match(artwork, /citizen-affairs-horizontal\.png/);
    assert.doesNotMatch(artwork, /<text\b|font-family=|<path\b/);
  }

  assert.match(logo, /width:\s*744/);
  assert.match(logo, /height:\s*312/);
  assert.match(logo, /image-rendering:\s*auto/);
});

test('news category navigation is static and mobile footer is collapsible', () => {
  const categoryNavigation = read('src/components/LatestTicker.astro');
  assert.doesNotMatch(categoryNavigation, /@keyframes|animation\s*:/);
  assert.match(categoryNavigation, /data-category-navigation/);
  assert.match(categoryNavigation, /ACTIVE_CATEGORY_IDS/);
  assert.match(categoryNavigation, /overflow-x: auto/);

  const footer = read('src/components/Footer.astro');
  assert.match(footer, /footer-mobile-groups/);
  assert.match(footer, /<details>/);
  assert.match(footer, /<summary>/);
});

test('homepage provides useful empty-content and citizen-task experiences', () => {
  const homepage = read('src/components/HomePage.astro');
  assert.match(homepage, /portal-start/);
  assert.match(homepage, /portal-promises/);
  assert.match(homepage, /portal-action-grid/);
  assert.match(homepage, /portal-method/);
  assert.match(homepage, /verificationLabels/);
});

test('portal navigation exposes the active citizen sections on desktop and mobile', () => {
  const header = read('src/components/PortalHeader.astro');
  assert.match(header, /portal-desktop-nav/);
  assert.match(header, /portal-mobile-bottom/);
  assert.match(header, /categories\/jobs/);
  assert.match(header, /categories\/materials/);
  assert.match(header, /categories\/projects/);
  assert.match(header, /categories\/affairs/);
});
