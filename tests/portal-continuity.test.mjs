import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const continuity = await readFile('src/components/PortalContinuity.astro', 'utf8');
const runtime = await readFile('src/components/PortalRuntime.astro', 'utf8');

test('portal continuity appears only on locale home routes', () => {
  assert.match(layout, /PortalContinuity/);
  assert.match(layout, /\['\/', '\/en', '\/bn', '\/hi'\]/);
  assert.match(layout, /isPortalHome &&/);
  assert.match(layout, /portal-continuity-wrap/);
});

test('homepage task continuity stays private to browser storage', () => {
  assert.match(continuity, /saved-articles/);
  assert.match(continuity, /recently-viewed/);
  assert.match(continuity, /localStorage\.getItem/);
  assert.match(continuity, /data-portal-continuity/);
  assert.match(continuity, /panel\.hidden = saved \+ recent === 0/);
  assert.doesNotMatch(continuity, /fetch\(/);
  assert.doesNotMatch(continuity, /innerHTML/);
});

test('continuity guidance is localized and links to action destinations', () => {
  assert.match(continuity, /Continue your tasks/);
  assert.match(continuity, /আপনার কাজ চালিয়ে যান/);
  assert.match(continuity, /अपना काम जारी रखें/);
  assert.match(continuity, /route\('saved'\)/);
  assert.match(continuity, /route\('deadlines'\)/);
  assert.match(continuity, /data-saved-count/);
  assert.match(continuity, /data-recent-count/);
});

test('navigation exposes saved and urgent deadline counts across layouts', () => {
  assert.match(runtime, /portal-saved-action/);
  assert.match(runtime, /portal-mobile-bottom a\[href\*="\/saved"\]/);
  assert.match(runtime, /portal-desktop-nav a\[href\*="\/deadlines"\]/);
  assert.match(runtime, /portal-mobile-panel a\[href\*="\/deadlines"\]/);
  assert.match(runtime, /portal-nav-count/);
  assert.match(runtime, /aria-label/);
  assert.match(runtime, /data-kind='urgent'/);
});

test('urgent deadline count is derived from the static locale index', () => {
  assert.match(runtime, /\/${locale}\/search-index\.json/);
  assert.match(runtime, /cache: 'no-store'/);
  assert.match(runtime, /days >= 0 && days <= 3/);
  assert.match(runtime, /loadUrgentDeadlineCount/);
  assert.match(runtime, /saved-card-actions button/);
});
