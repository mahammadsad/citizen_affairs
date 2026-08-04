import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const searchPage = await readFile('src/components/SearchPage.astro', 'utf8');
const searchIndex = await readFile('src/pages/[lang]/search-index.json.ts', 'utf8');

test('search covers every active citizen-information content type', () => {
  for (const type of ['job', 'scheme', 'admission', 'scholarship', 'service', 'alert', 'explainer']) {
    assert.match(searchPage, new RegExp(`${type}:`));
  }
  assert.match(searchPage, /name="category"/);
  assert.match(searchPage, /name="level"/);
  assert.match(searchPage, /name="state"/);
  assert.match(searchPage, /name="status"/);
  assert.match(searchPage, /name="verification"/);
  assert.match(searchPage, /name="qualification"/);
  assert.match(searchPage, /name="sort"/);
});

test('search state is shareable and filters can be cleared individually', () => {
  assert.match(searchPage, /const fields = \['q', 'type', 'category', 'level', 'state', 'status', 'verification', 'qualification', 'sort'\]/);
  assert.match(searchPage, /history\.replaceState/);
  assert.match(searchPage, /syncFromUrl/);
  assert.match(searchPage, /data-clear-field/);
  assert.match(searchPage, /renderActiveFilters/);
  assert.match(searchPage, /addEventListener\('popstate'/);
});

test('search ranks and sorts results without weakening fuzzy multilingual matching', () => {
  assert.match(searchPage, /const queryScore/);
  assert.match(searchPage, /distanceAtMostOne/);
  assert.match(searchPage, /synonymGroups/);
  assert.match(searchPage, /sort === 'newest'/);
  assert.match(searchPage, /sort === 'deadline'/);
  assert.match(searchPage, /sort === 'alphabetical'/);
  assert.match(searchPage, /b\.score - a\.score/);
});

test('search provides accessible result and recovery guidance in three languages', () => {
  assert.match(searchPage, /aria-live="polite"/);
  assert.match(searchPage, /aria-busy="true"/);
  assert.match(searchPage, /No exact match found/);
  assert.match(searchPage, /সঠিক মিল পাওয়া যায়নি/);
  assert.match(searchPage, /सटीक मिलान नहीं मिला/);
  assert.match(searchPage, /Search index could not be loaded/);
  assert.match(searchPage, /সার্চ সূচি লোড করা যায়নি/);
  assert.match(searchPage, /खोज सूची लोड नहीं हो सकी/);
  assert.match(searchPage, /data-message-action/);
});

test('search index exposes structured discovery metadata and all content families', () => {
  assert.match(searchIndex, /data\.job\?\.officialApplicationUrl/);
  assert.match(searchIndex, /data\.scheme\?\.officialPortal/);
  assert.match(searchIndex, /data\.admission\?\.officialApplicationUrl/);
  assert.match(searchIndex, /data\.scholarship\?\.officialPortal/);
  assert.match(searchIndex, /data\.service\?\.officialPortal/);
  assert.match(searchIndex, /data\.alert\?\.officialOrderUrl/);
  assert.match(searchIndex, /published: data\.date\.toISOString\(\)/);
  assert.match(searchIndex, /updated: \(data\.updated \|\| data\.lastVerified \|\| data\.date\)\.toISOString\(\)/);
  assert.match(searchIndex, /sourceCount: sourceUrls\.length/);
  assert.match(searchIndex, /actionAvailable:/);
  assert.match(searchIndex, /regionName\(data\.state, locale\)/);
});
