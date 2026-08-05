import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const homepage = await readFile('src/components/CitizenPortalHome.astro', 'utf8');

test('homepage is led by published news instead of a duplicate search form', () => {
  assert.match(homepage, /class="news-hero"/);
  assert.match(homepage, /class="top-stories-grid"/);
  assert.match(homepage, /class="lead-story"/);
  assert.doesNotMatch(homepage, /class="portal-search"/);
  assert.doesNotMatch(homepage, /<form[^>]+action=\{localizedPath\(locale, 'search'\)\}/);
});

test('homepage includes a transparent BBC-style numbered trending block', () => {
  assert.match(homepage, /class="trending-section"/);
  assert.match(homepage, /class="trending-list"/);
  assert.match(homepage, /String\(index \+ 1\)\.padStart\(2, '0'\)/);
  assert.match(homepage, /ordered by recency, not personal tracking/);
  assert.match(homepage, /সাম্প্রতিকতার ভিত্তিতে সাজানো, ব্যক্তিগত tracking-এর ভিত্তিতে নয়/);
});

test('every active portal division receives its own latest-news block', () => {
  assert.match(homepage, /ACTIVE_CATEGORY_IDS\.map/);
  assert.match(homepage, /class="section-news-grid"/);
  assert.match(homepage, /class="section-news-block"/);
  assert.match(homepage, /articles\.filter\(\(article\) => article\.data\.category === id\)\.slice\(0, 3\)/);
  assert.match(homepage, /No verified public story is available in this section yet/);
  assert.match(homepage, /এই বিভাগে এখনও কোনো যাচাইকৃত প্রকাশিত খবর নেই/);
});

test('search remains outside the homepage hero through navigation routes', () => {
  assert.match(homepage, /href=\{route\('articles'\)\}/);
  assert.doesNotMatch(homepage, /input type="search"/);
});
