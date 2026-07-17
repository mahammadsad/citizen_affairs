import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/ArticleLayout.astro', 'utf8');
const authorPage = await readFile('src/pages/authors/[slug].astro', 'utf8');

test('article bylines route to the attributed public author profile', () => {
  assert.match(layout, /authorProfilePath\(locale,author\)/);
  assert.doesNotMatch(layout, /trustPagePath\(locale,'author'\)/);
  assert.match(authorPage, /params: \{ slug: author\.id \}/);
});
