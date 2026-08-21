import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const continuity = await readFile('src/components/PortalContinuity.astro', 'utf8');
const runtime = await readFile('src/components/PortalRuntime.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');

test('homepage opens with primary portal content instead of a personal continuity panel', () => {
  assert.doesNotMatch(layout, /PortalContinuity/);
  assert.doesNotMatch(layout, /portal-continuity-wrap/);
  assert.match(layout, /<main id="main-content"[^>]*>\s*<slot \/>/);
});

test('task continuity remains private to browser storage when used in dedicated action views', () => {
  assert.match(continuity, /saved-articles/);
  assert.match(continuity, /recently-viewed/);
  assert.match(continuity, /localStorage\.getItem/);
  assert.match(continuity, /data-portal-continuity/);
  assert.match(continuity, /panel\.hidden = saved \+ recent === 0/);
  assert.doesNotMatch(continuity, /fetch\(/);
  assert.doesNotMatch(continuity, /innerHTML/);
});

test('continuity guidance stays localized and points to dedicated action destinations', () => {
  assert.match(continuity, /Continue your tasks/);
  assert.match(continuity, /আপনার কাজ চালিয়ে যান/);
  assert.match(continuity, /अपना काम जारी रखें/);
  assert.match(continuity, /route\('saved'\)/);
  assert.match(continuity, /route\('deadlines'\)/);
  assert.match(continuity, /data-saved-count/);
  assert.match(continuity, /data-recent-count/);
});

test('global navigation keeps saved and deadlines available without count-badge chrome', () => {
  assert.match(header, /portal-saved-action/);
  assert.match(header, /route\('saved'\)/);
  assert.match(header, /route\('deadlines'\)/);
  assert.doesNotMatch(runtime, /portal-nav-count/);
  assert.doesNotMatch(runtime, /loadUrgentDeadlineCount/);
  assert.doesNotMatch(runtime, /search-index\.json/);
});