import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const searchPage = await readFile('src/components/SearchPage.astro', 'utf8');
const searchIndex = await readFile('src/pages/[lang]/search-index.json.ts', 'utf8');

test('search uses one primary information taxonomy instead of competing type and section filters', () => {
  for (const type of ['job', 'scheme', 'admission', 'scholarship', 'service', 'alert', 'explainer']) {
    assert.match(searchPage, new RegExp(`${type}:`));
  }
  assert.match(searchPage, /name="type"/);
  assert.doesNotMatch(searchPage, /name="category"/);
  assert.doesNotMatch(searchPage, /allCategories/);
  assert.match(searchPage, /meta\.textContent = \[typeLabels\[item\.type \|\| ''\], item\.verification\]/);
  assert.doesNotMatch(searchPage, /typeLabels\[item\.type \|\| ''\], item\.category, item\.verification/);
});

test('secondary search controls are progressive and semantically distinct', () => {
  assert.match(searchPage, /id="advancedSearchFilters"/);
  assert.match(searchPage, /More filters/);
  assert.match(searchPage, /আরও ফিল্টার/);
  assert.match(searchPage, /और फ़िल्टर/);
  assert.match(searchPage, /Government scope/);
  assert.match(searchPage, /Applicable location/);
  assert.match(searchPage, /name="level"/);
  assert.match(searchPage, /name="state"/);
  assert.match(searchPage, /name="status"/);
  assert.match(searchPage, /name="verification"/);
  assert.match(searchPage, /name="qualification"/);
  assert.match(searchPage, /name="sort"/);
  assert.doesNotMatch(searchPage, /option value="west-bengal"/);
  assert.doesNotMatch(searchPage, /option value="other-state"/);
});

test('search state remains shareable and old section URLs migrate to information types', () => {
  assert.match(searchPage, /const fields = \['q', 'type', 'level', 'state', 'status', 'verification', 'qualification', 'sort'\]/);
  assert.match(searchPage, /const legacyCategoryTypes/);
  assert.match(searchPage, /jobs: 'job'/);
  assert.match(searchPage, /projects: 'scheme'/);
  assert.match(searchPage, /exams: 'admission'/);
  assert.match(searchPage, /params\.get\('category'\)/);
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

test('search index exposes structured metadata and normalizes overlapping geography fields', () => {
  assert.match(searchIndex, /data\.job\?\.officialApplicationUrl/);
  assert.match(searchIndex, /data\.scheme\?\.officialPortal/);
  assert.match(searchIndex, /data\.admission\?\.officialApplicationUrl/);
  assert.match(searchIndex, /data\.scholarship\?\.officialPortal/);
  assert.match(searchIndex, /data\.service\?\.officialPortal/);
  assert.match(searchIndex, /data\.alert\?\.officialOrderUrl/);
  assert.match(searchIndex, /const governmentScope = \['west-bengal', 'other-state'\]\.includes/);
  assert.match(searchIndex, /\? 'state'/);
  assert.match(searchIndex, /data\.governmentLevel === 'west-bengal' \? 'west-bengal' : ''/);
  assert.match(searchIndex, /governmentLevel: governmentScope/);
  assert.match(searchIndex, /published: data\.date\.toISOString\(\)/);
  assert.match(searchIndex, /updated: \(data\.updated \|\| data\.lastVerified \|\| data\.date\)\.toISOString\(\)/);
  assert.match(searchIndex, /sourceCount: sourceUrls\.length/);
  assert.match(searchIndex, /actionAvailable:/);
  assert.match(searchIndex, /regionName\(state, locale\)/);
});
