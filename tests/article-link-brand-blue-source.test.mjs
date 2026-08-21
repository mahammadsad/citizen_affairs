import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const articleLinkCss = await readFile('public/assets/article-link-brand-blue-v2.css', 'utf8');
const layout = await readFile('src/layouts/BaseLayout.astro', 'utf8');

test('article hyperlinks use Citizen Affairs brand blue from a cache-busting stylesheet', () => {
  assert.match(layout, /article-link-brand-blue-v2\.css/);
  assert.match(articleLinkCss, /#0a5aa6/);
  assert.match(articleLinkCss, /article\[data-article\][\s\S]*a:any-link/);
  assert.doesNotMatch(articleLinkCss, /#b42318|#ff8a80|180,\s*35,\s*24|255,\s*138,\s*128/);
});
