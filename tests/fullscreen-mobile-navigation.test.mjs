import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');
const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');

test('mobile navigation is mounted as a full-screen modal surface', () => {
  assert.match(layout, /MobileNavigationRuntime/);
  assert.match(runtime, /portal-mobile-menu\[open\] > \.portal-mobile-panel/);
  assert.match(runtime, /inset: 0 !important/);
  assert.match(runtime, /height: 100dvh !important/);
  assert.match(runtime, /aria-modal/);
  assert.match(runtime, /portal-menu-open/);
});

test('mobile navigation includes localized search and newsroom-style rows', () => {
  assert.match(runtime, /portal-mobile-menu-search/);
  assert.match(runtime, /searchInput\.name = 'q'/);
  assert.match(runtime, /খবর, চাকরি, প্রকল্প ও আরও তথ্য খুঁজুন/);
  assert.match(runtime, /portal-mobile-home/);
  assert.match(runtime, /portal-mobile-row-arrow/);
  assert.match(runtime, /nav a > svg:first-child/);
});

test('mobile navigation supports close, Escape, focus restoration and trapping', () => {
  assert.match(runtime, /portal-mobile-close/);
  assert.match(runtime, /event\.key === 'Escape'/);
  assert.match(runtime, /trigger\.focus\(\)/);
  assert.match(runtime, /focusableSelector/);
  assert.match(runtime, /event\.key !== 'Tab'/);
});
