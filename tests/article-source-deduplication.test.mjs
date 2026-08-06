import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sourceRecords = await readFile('src/lib/source-records.ts', 'utf8');
const articleLayout = await readFile('src/layouts/ArticleLayout.astro', 'utf8');

test('article sources are normalized and deduplicated before display', () => {
  assert.match(sourceRecords, /export function normalizeSourceUrl/);
  assert.match(sourceRecords, /const seen = new Set<string>\(\)/);
  assert.match(sourceRecords, /if \(!normalized \|\| seen\.has\(normalized\)\) return/);
  assert.match(sourceRecords, /sources\.forEach\(add\)/);
  assert.match(sourceRecords, /sourceUrls\.forEach/);
});

test('article trust count and source list share the same canonical records', () => {
  assert.match(articleLayout, /const listedSources=mergeSourceRecords\(\{sources,sourceUrls\}\)/);
  assert.match(articleLayout, /const sourceCount=mergeSourceRecords\(\{sources,sourceUrls,officialNoticeUrl\}\)\.length/);
  assert.match(articleLayout, /listedSources\.map/);
  assert.doesNotMatch(articleLayout, /sources\.length\+sourceUrls\.length/);
  assert.doesNotMatch(articleLayout, /sourceUrls\.map\(\(url,i\)/);
});
