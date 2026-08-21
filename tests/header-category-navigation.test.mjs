import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const mobileRuntime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');

test('header uses one editorial navigation system instead of a duplicated category strip', () => {
  assert.match(header, /portal-desktop-nav/);
  assert.match(header, /portal-mobile-panel/);
  assert.doesNotMatch(header, /LatestTicker/);
  assert.doesNotMatch(header, /portal-mobile-bottom/);
  assert.doesNotMatch(header, /portal-utility/);
});

test('desktop navigation remains localized and exposes newsroom utility destinations', () => {
  assert.match(header, /Jobs/);
  assert.match(header, /চাকরি/);
  assert.match(header, /नौकरियाँ/);
  assert.match(header, /Latest Updates/);
  assert.match(header, /সর্বশেষ আপডেট/);
  assert.match(header, /नवीनतम अपडेट/);
  assert.match(header, /route\('articles'\)/);
  assert.match(header, /route\('deadlines'\)/);
});

test('compact navigation remains active until wide desktop widths', () => {
  assert.match(header, /@media \(min-width: 1280px\)/);
  assert.match(header, /@media \(max-width: 1279px\)/);
  assert.match(mobileRuntime, /matchMedia\('\(min-width: 1280px\)'\)/);
});

test('search and saved are first-class mobile destinations', () => {
  assert.match(header, /portal-search-action/);
  assert.match(header, /<a href=\{route\('search'\)\}>/);
  assert.match(header, /<a href=\{route\('saved'\)\}>/);
});
