import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const homepage = await readFile('src/components/CitizenPortalHome.astro', 'utf8');

test('homepage is structured as a news front page rather than an explanatory dashboard', () => {
  assert.match(homepage, /class="top-news"/);
  assert.match(homepage, /class="top-stories-grid"/);
  assert.match(homepage, /class="latest-rail"/);
  assert.match(homepage, /class="news-sections"/);
  assert.doesNotMatch(homepage, /news-masthead|trending-section|deadline-section|news-trust/);
});

test('unprofessional explanatory homepage wording is removed', () => {
  assert.doesNotMatch(homepage, /ট্রেন্ডিং এখন/);
  assert.doesNotMatch(homepage, /প্রতিটি বিভাগের সর্বশেষ খবর/);
  assert.doesNotMatch(homepage, /ব্যক্তিগত tracking/);
  assert.doesNotMatch(homepage, /এই বিভাগে এখনও কোনো যাচাইকৃত প্রকাশিত খবর নেই/);
});

test('only sections containing published stories are rendered', () => {
  assert.match(homepage, /\.filter\(\(section\) => section\.articles\.length > 0\)/);
  assert.doesNotMatch(homepage, /class="section-empty"/);
});

test('the lead image and familiar news labels remain prominent', () => {
  assert.match(homepage, /<StoryImage article=\{lead\} variant="lead" priority \/>/);
  assert.match(homepage, /pageTitle: 'সর্বশেষ খবর'/);
  assert.match(homepage, /leadLabel: 'প্রধান খবর'/);
  assert.match(homepage, /allNews: 'সব খবর'/);
});
