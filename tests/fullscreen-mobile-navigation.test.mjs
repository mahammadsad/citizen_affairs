import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');
const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');

test('mobile navigation expands below the header and stays in document flow', () => {
  assert.match(layout, /MobileNavigationRuntime/);
  assert.match(header, /class="portal-icon-action portal-mobile-trigger"/);
  assert.match(header, /id="portalMobilePanel"/);
  assert.match(header, /grid-template-rows: 0fr/);
  assert.match(header, /grid-template-rows: 1fr/);
  assert.doesNotMatch(header, /position:\s*fixed[\s\S]*portal-mobile-panel/);
  assert.doesNotMatch(runtime, /aria-modal/);
  assert.doesNotMatch(runtime, /portal-menu-open/);
});

test('hamburger morph and menu rows use reference-style motion', () => {
  assert.match(header, /portal-menu-icon/);
  assert.match(header, /rotate\(45deg\)/);
  assert.match(header, /rotate\(-45deg\)/);
  assert.match(header, /cubic-bezier\(\.22, 1, \.36, 1\)/);
  assert.match(header, /translateY\(-7px\)/);
  assert.match(header, /border-bottom: 1px solid var\(--color-border\)/);
});

test('mobile navigation supports accessible toggle, Escape and focus restoration', () => {
  assert.match(runtime, /aria-expanded/);
  assert.match(runtime, /aria-hidden/);
  assert.match(runtime, /setAttribute\('inert'/);
  assert.match(runtime, /event\.key === 'Escape'/);
  assert.match(runtime, /trigger\.focus\(\)/);
  assert.match(runtime, /desktopQuery/);
});
