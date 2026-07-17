import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8');

test('article hero preserves the source aspect ratio at every viewport', () => {
  assert.match(layout, /\.article-hero-picture\{[^}]*width:100%/);
  assert.match(layout, /\.article-hero-image\{[^}]*width:100%[^}]*height:auto[^}]*object-fit:contain/);
  assert.doesNotMatch(layout, /\.article-hero-image\{[^}]*object-fit:cover/);
  assert.doesNotMatch(layout, /\.article-hero-image\{[^}]*aspect-ratio:/);
});
