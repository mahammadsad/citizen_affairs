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
    'citizen-affairs-horizontal.svg',
    'citizen-affairs-horizontal-dark.svg',
    'citizen-affairs-monogram.png',
    'citizen-affairs-circular.png'
  ]) {
    assert.match(logo, new RegExp(asset.replace('.', '\\.')));
    assert.ok(readFileSync(new URL(`../public/assets/brand/${asset}`, import.meta.url)).length > 0);
  }

  for (const asset of ['citizen-affairs-horizontal.svg', 'citizen-affairs-horizontal-dark.svg']) {
    const artwork = read(`public/assets/brand/${asset}`);
    assert.match(artwork, /official brand master/);
    assert.match(artwork, /viewBox="0 0 395 150"/);
    assert.match(artwork, /fill-rule="evenodd"/);
    assert.doesNotMatch(artwork, /<text\b|font-family=/);
  }

  assert.match(logo, /width:\s*395/);
  assert.match(logo, /height:\s*150/);
  assert.doesNotMatch(logo, /horizontal:\s*\{[\s\S]*citizen-affairs-horizontal\.png/);
});

test('publication footer remains compact and collapsible on mobile', () => {
  const footer = read('src/components/Footer.astro');
  assert.match(footer, /footer-mobile-groups/);
  assert.match(footer, /<details>/);
  assert.match(footer, /<summary>/);
  assert.doesNotMatch(footer, /footer-cta-grid/);
});

test('homepage provides useful empty-content and citizen-task experiences', () => {
  const homepage = read('src/components/HomePage.astro');
  assert.match(homepage, /portal-start/);
  assert.match(homepage, /portal-promises/);
  assert.match(homepage, /portal-action-grid/);
  assert.match(homepage, /portal-method/);
  assert.match(homepage, /verificationLabels/);
});

test('portal navigation exposes citizen sections without a duplicate category bar', () => {
  const header = read('src/components/PortalHeader.astro');
  assert.match(header, /portal-desktop-nav/);
  assert.match(header, /portal-mobile-panel/);
  assert.match(header, /portal-search-action/);
  assert.match(header, /route\('saved'\)/);
  assert.match(header, /categories\/jobs/);
  assert.match(header, /categories\/materials/);
  assert.match(header, /categories\/projects/);
  assert.match(header, /categories\/affairs/);
  assert.doesNotMatch(header, /LatestTicker/);
  assert.doesNotMatch(header, /portal-mobile-bottom/);
});