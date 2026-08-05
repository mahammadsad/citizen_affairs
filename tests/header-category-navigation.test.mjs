import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const categoryNavigation = await readFile('src/components/LatestTicker.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');

test('the old single-headline ticker is replaced by a complete news category navigation', () => {
  assert.match(header, /<LatestTicker \{locale\} \/>/);
  assert.match(categoryNavigation, /data-category-navigation/);
  assert.match(categoryNavigation, /getCollection\('categories'\)/);
  assert.match(categoryNavigation, /ACTIVE_CATEGORY_IDS/);
  assert.match(categoryNavigation, /categoryName\(category, locale\)/);
  assert.match(categoryNavigation, /data-category-link=\{link\.id\}/);
  assert.doesNotMatch(categoryNavigation, /getLocalizedArticles|latest-message|latest-label/);
});

test('category navigation is localized and includes newsroom utility destinations', () => {
  assert.match(categoryNavigation, /News categories/);
  assert.match(categoryNavigation, /সংবাদ বিভাগ/);
  assert.match(categoryNavigation, /समाचार श्रेणियाँ/);
  assert.match(categoryNavigation, /Latest News/);
  assert.match(categoryNavigation, /সর্বশেষ খবর/);
  assert.match(categoryNavigation, /ताज़ा खबरें/);
  assert.match(categoryNavigation, /route\('articles'\)/);
  assert.match(categoryNavigation, /route\('deadlines'\)/);
});

test('language and more menus are layered above the category bar', () => {
  assert.match(categoryNavigation, /:global\(\.portal-navbar\)[\s\S]*z-index: 40/);
  assert.match(categoryNavigation, /:global\(\.portal-language\[open\]\)[\s\S]*z-index: 80/);
  assert.match(categoryNavigation, /:global\(\.portal-language > div\)[\s\S]*z-index: 90/);
  assert.match(categoryNavigation, /\.category-nav-shell[\s\S]*z-index: 10/);
});

test('mobile category navigation scrolls inside the header without widening the page', () => {
  assert.match(categoryNavigation, /overflow-x: auto/);
  assert.match(categoryNavigation, /scroll-snap-type: inline proximity/);
  assert.match(categoryNavigation, /scrollbar-width: none/);
  assert.match(categoryNavigation, /-webkit-overflow-scrolling: touch/);
});
