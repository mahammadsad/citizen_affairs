import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const enhancer = await readFile('src/components/SearchResultsCardEnhancer.astro', 'utf8');
const localizedSearchPage = await readFile('src/pages/[lang]/search.astro', 'utf8');
const englishSearchPage = await readFile('src/pages/search.astro', 'utf8');

test('search results use horizontal homepage-style article cards', () => {
  assert.match(enhancer, /grid-template-areas: 'media content'/);
  assert.match(enhancer, /grid-template-columns: minmax\(180px, 220px\) minmax\(0, 1fr\)/);
  assert.match(enhancer, /grid-template-columns: 112px minmax\(0, 1fr\)/);
  assert.match(enhancer, /aspect-ratio: 4 \/ 3/);
  assert.match(enhancer, /border-radius: 14px/);
  assert.match(enhancer, /link\.prepend\(media\)/);
});

test('mobile cards clamp headlines and excerpts without broken overflow', () => {
  assert.match(enhancer, /-webkit-line-clamp: 3/);
  assert.match(enhancer, /-webkit-line-clamp: 2/);
  assert.match(enhancer, /text-overflow: ellipsis/);
  assert.match(enhancer, /padding-bottom: calc\(6\.25rem \+ env\(safe-area-inset-bottom\)\)/);
});

test('result metadata is compact and localized', () => {
  assert.match(enhancer, /split\('·'\)\[0\]/);
  assert.match(enhancer, /language\.startsWith\('bn'\)/);
  assert.match(enhancer, /'পড়ুন'/);
  assert.match(enhancer, /read\.textContent = `\$\{readLabel\} →`/);
  assert.match(enhancer, /image\.loading = 'lazy'/);
});

test('all public search routes load the card enhancer', () => {
  assert.match(localizedSearchPage, /import SearchResultsCardEnhancer/);
  assert.match(localizedSearchPage, /<SearchResultsCardEnhancer \/>/);
  assert.match(englishSearchPage, /import SearchResultsCardEnhancer/);
  assert.match(englishSearchPage, /<SearchResultsCardEnhancer \/>/);
});
