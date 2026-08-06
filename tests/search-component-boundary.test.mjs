import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const enhancer = await readFile('src/components/SearchResultsCardEnhancer.astro', 'utf8');
const englishPage = await readFile('src/pages/search.astro', 'utf8');
const localizedPage = await readFile('src/pages/[lang]/search.astro', 'utf8');

test('search pages use one enhancement component', () => {
  for (const page of [englishPage, localizedPage]) {
    assert.match(page, /SearchResultsCardEnhancer/);
    assert.doesNotMatch(page, /SearchResultPlaceholderFix/);
  }
});

test('one observer handles cards and placeholders without changing presentation CSS', () => {
  assert.equal((enhancer.match(/new MutationObserver/g) || []).length, 1);
  assert.match(enhancer, /createPlaceholderIcon/);
  assert.match(enhancer, /result-media-placeholder/);
  assert.match(enhancer, /result-placeholder-icon/);
  assert.match(enhancer, /grid-template-columns: minmax\(180px, 220px\) minmax\(0, 1fr\)/);
});
