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

test('responsive interface uses vector Citizen Affairs brand assets', () => {
  const logo = read('src/components/BrandLogo.astro');
  for (const asset of [
    'citizen-affairs-full.svg',
    'citizen-affairs-horizontal.svg',
    'citizen-affairs-monogram.svg',
    'citizen-affairs-circular.svg'
  ]) {
    assert.match(logo, new RegExp(asset.replace('.', '\\.')));
    assert.match(read(`public/assets/brand/${asset}`), /<svg[\s>]/);
  }
});

test('latest information bar is static and mobile footer is collapsible', () => {
  const ticker = read('src/components/LatestTicker.astro');
  assert.doesNotMatch(ticker, /@keyframes|animation\s*:/);
  assert.match(ticker, /latest-message/);
  assert.match(ticker, /lead &&/);

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
  assert.match(homepage, /officially-confirmed/);
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
