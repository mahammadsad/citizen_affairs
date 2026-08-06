import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const enhancer = await readFile('src/components/SearchResultsCardEnhancer.astro', 'utf8');
const rootRoute = await readFile('src/pages/search.astro', 'utf8');
const localizedRoute = await readFile('src/pages/[lang]/search.astro', 'utf8');

for (const [name, route] of [['root', rootRoute], ['localized', localizedRoute]]) {
  test(`${name} search route uses one enhancement layer`, () => {
    assert.match(route, /SearchResultsCardEnhancer/);
    assert.doesNotMatch(route, /SearchResultPlaceholderFix/);
  });
}

test('the search enhancer owns both card cleanup and neutral placeholders', () => {
  assert.match(enhancer, /const createPlaceholderIcon/);
  assert.match(enhancer, /result-placeholder-icon/);
  assert.match(enhancer, /media\.replaceChildren\(createPlaceholderIcon\(\)\)/);
  assert.equal((enhancer.match(/new MutationObserver/g) || []).length, 1);
});
