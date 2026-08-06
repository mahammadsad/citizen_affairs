import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const runtime = await readFile(
  'src/components/MobileBottomNavigationRuntime.astro',
  'utf8',
);

test('the shared layout mounts the scroll-aware mobile bottom navigation runtime', () => {
  assert.match(layout, /MobileBottomNavigationRuntime/);
  assert.match(layout, /<MobileBottomNavigationRuntime \/>/);
});

test('the bottom navigation hides during scrolling and returns after scrolling stops', () => {
  assert.match(runtime, /window\.addEventListener\('scroll', hideNavigation, \{ passive: true \}\)/);
  assert.match(runtime, /scrollStopDelay = 180/);
  assert.match(runtime, /window\.setTimeout\(showNavigation, scrollStopDelay\)/);
  assert.match(runtime, /'onscrollend' in window/);
  assert.match(runtime, /window\.addEventListener\('scrollend', showNavigation/);
  assert.match(runtime, /classList\.add\('is-scroll-hidden'\)/);
  assert.match(runtime, /classList\.remove\('is-scroll-hidden'\)/);
});

test('the scroll treatment preserves accessibility and mobile-only behaviour', () => {
  assert.match(runtime, /matchMedia\('\(max-width: 680px\)'\)/);
  assert.match(runtime, /navigation\.matches\(':focus-within'\)/);
  assert.match(runtime, /navigation\.addEventListener\('focusin', showNavigation\)/);
  assert.match(runtime, /pointer-events: none/);
  assert.match(runtime, /prefers-reduced-motion: reduce/);
  assert.match(runtime, /translateY\(calc\(100% \+ env\(safe-area-inset-bottom\)\)\)/);
});
