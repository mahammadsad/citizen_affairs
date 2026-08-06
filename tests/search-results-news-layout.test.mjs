import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const searchPage = await readFile('src/components/SearchPage.astro', 'utf8');
const searchIndex = await readFile('src/pages/[lang]/search-index.json.ts', 'utf8');

test('search results use a familiar news-list presentation', () => {
  assert.match(searchPage, /resultsTitle: 'Search results'/);
  assert.match(searchPage, /readArticle: 'Read article'/);
  assert.match(searchPage, /className = 'search-result-row'/);
  assert.match(searchPage, /className = 'search-result-link'/);
  assert.match(searchPage, /className = 'result-media'/);
  assert.match(searchPage, /className = 'result-read'/);
  assert.match(searchPage, /-webkit-line-clamp: 2/);
  assert.doesNotMatch(searchPage, /className = 'search-result-card'/);
});

test('search result rows receive article thumbnails when available', () => {
  assert.match(searchIndex, /image: data\.featuredImage \|\| ''/);
  assert.match(searchIndex, /imageAlt: data\.featuredImageAlt \|\| data\.title/);
  assert.match(searchPage, /if \(item\.image\)/);
  assert.match(searchPage, /image\.loading = 'lazy'/);
});

test('English search results use canonical root article routes', () => {
  assert.match(searchIndex, /locale === 'en'/);
  assert.match(searchIndex, /\$\{SITE\.basePath\}articles\/\$\{slug\}\//);
  assert.match(searchIndex, /\$\{SITE\.basePath\}\$\{locale\}\/articles\/\$\{slug\}\//);
  assert.match(searchIndex, /href: articleHref\(locale, data\.urlSlug\)/);
  assert.doesNotMatch(searchIndex, /href: `\$\{SITE\.basePath\}\$\{locale\}\/articles/);
});
