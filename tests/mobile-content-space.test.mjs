import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const menuRuntime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');
const categoryNavigation = await readFile('src/components/LatestTicker.astro', 'utf8');

test('mobile pages no longer reserve a persistent bottom navigation strip', () => {
  assert.match(
    layout,
    /:global\(\.portal-mobile-bottom\)[\s\S]*display: none !important/,
  );
  assert.match(
    layout,
    /:global\(body\)[\s\S]*padding-bottom: env\(safe-area-inset-bottom\) !important/,
  );
  assert.doesNotMatch(
    layout,
    /padding-bottom:\s*calc\(60px\s*\+\s*env\(safe-area-inset-bottom\)\)/,
  );
});

test('search and saved remain available from the expanding mobile menu', () => {
  assert.match(menuRuntime, /legacyBottomNavigation/);
  assert.match(menuRuntime, /pathname\.endsWith\('\/search'\)/);
  assert.match(menuRuntime, /pathname\.endsWith\('\/saved'\)/);
  assert.match(menuRuntime, /portal-mobile-utility-link/);
  assert.match(menuRuntime, /homeLink\?\.after\(utilityFragment\)/);
});

test('mobile header chrome is compact without shrinking below normal touch targets', () => {
  assert.match(layout, /min-height: 66px !important/);
  assert.match(
    categoryNavigation,
    /@media \(max-width: 680px\)[\s\S]*\.category-nav \{[\s\S]*min-height: 44px/,
  );
  assert.match(
    categoryNavigation,
    /\.category-nav a \{[\s\S]*min-height: 44px/,
  );
});
