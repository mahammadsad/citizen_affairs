import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const menuRuntime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');

test('mobile pages do not mount or reserve a persistent bottom navigation strip', () => {
  assert.doesNotMatch(layout, /MobileBottomNavigationRuntime/);
  assert.doesNotMatch(header, /portal-mobile-bottom/);
  assert.match(
    layout,
    /:global\(body\)[\s\S]*padding-bottom: env\(safe-area-inset-bottom\) !important/,
  );
});

test('search and saved are native destinations in the expanding mobile menu', () => {
  assert.match(header, /<a href=\{route\('search'\)\}>/);
  assert.match(header, /<a href=\{route\('saved'\)\}>/);
  assert.doesNotMatch(menuRuntime, /legacyBottomNavigation/);
  assert.doesNotMatch(menuRuntime, /cloneNode/);
});

test('mobile header chrome stays compact and preserves normal touch targets', () => {
  assert.match(header, /\.portal-navbar-inner \{[\s\S]*min-height: 62px/);
  assert.match(header, /\.portal-icon-action,[\s\S]*min-height: 40px/);
  assert.match(header, /\.portal-mobile-panel nav a \{[\s\S]*min-height: 48px/);
});