import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const helper = await readFile('src/lib/source-records.ts', 'utf8');
const englishPage = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedPage = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');

test('source URLs are canonicalized before duplicate checks', () => {
  assert.match(helper, /export function normalizeSourceUrl/);
  assert.match(helper, /url\.hash = ''/);
  assert.match(helper, /url\.hostname = url\.hostname\.toLowerCase\(\)/);
  assert.match(helper, /seen = new Set<string>\(\)/);
  assert.match(helper, /key === officialKey \|\| seen\.has\(key\)/);
});

test('all article routes pass only deduplicated source records to the existing layout', () => {
  for (const page of [englishPage, localizedPage]) {
    assert.match(page, /deduplicateSourceRecords/);
    assert.match(page, /sourceUrls=\{displaySourceRecords\.sourceUrls\}/);
    assert.match(page, /sources=\{displaySourceRecords\.sources\}/);
    assert.match(page, /\.map\(normalizeSourceUrl\)/);
    assert.doesNotMatch(page, /sourceUrls=\{article\.data\.sourceUrls\}/);
    assert.doesNotMatch(page, /sources=\{article\.data\.sources\}/);
  }
});
