import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const homepage = await readFile('src/components/CitizenPortalHome.astro', 'utf8');
const storyImage = await readFile('src/components/StoryImage.astro', 'utf8');

test('homepage is led by published news instead of a duplicate search form', () => {
  assert.match(homepage, /class="top-news"/);
  assert.match(homepage, /class="top-stories-grid"/);
  assert.match(homepage, /'lead-story'/);
  assert.match(homepage, /class="latest-rail"/);
  assert.doesNotMatch(homepage, /class="portal-search"/);
  assert.doesNotMatch(homepage, /<form[^>]+action=\{localizedPath\(locale, 'search'\)\}/);
});

test('the lead story renders its approved responsive editorial image', () => {
  assert.match(homepage, /import StoryImage from '\.\/StoryImage\.astro'/);
  assert.match(homepage, /<StoryImage article=\{lead\} variant="lead" priority \/>/);
  assert.match(homepage, /Boolean\(lead\.data\.featuredImage\)/);
  assert.match(storyImage, /type="image\/avif"/);
  assert.match(storyImage, /featuredImageSrcSet/);
  assert.match(storyImage, /width=\{featuredImageWidth\}/);
  assert.match(storyImage, /height=\{featuredImageHeight\}/);
  assert.match(storyImage, /alt=\{featuredImageAlt \|\| title\}/);
  assert.match(storyImage, /loading=\{priority \? 'eager' : 'lazy'\}/);
  assert.match(storyImage, /fetchpriority=\{priority \? 'high' : 'auto'\}/);
});

test('secondary image slots remain conditional and never invent placeholders', () => {
  assert.match(homepage, /Boolean\(article\.data\.featuredImage\)/);
  assert.match(homepage, /<StoryImage article=\{article\} variant="thumbnail" \/>/);
  assert.match(homepage, /article\.data\.featuredImage && \(/);
  assert.doesNotMatch(storyImage, /placeholder|fallback-image|unsplash|picsum/i);
});

test('homepage uses a conventional latest-news rail instead of a ranked trending panel', () => {
  assert.match(homepage, /class="latest-rail"/);
  assert.match(homepage, /class="latest-rail-list"/);
  assert.match(homepage, /supportingStories\.map/);
  assert.doesNotMatch(homepage, /class="trending-section"/);
  assert.doesNotMatch(homepage, /String\(index \+ 1\)\.padStart/);
  assert.doesNotMatch(homepage, /personal tracking|ব্যক্তিগত tracking/);
});

test('only portal divisions with published stories receive a news section', () => {
  assert.match(homepage, /ACTIVE_CATEGORY_IDS\.map/);
  assert.match(homepage, /class="news-section-list"/);
  assert.match(homepage, /class="news-section-block"/);
  assert.match(homepage, /articles\.filter\(\(article\) => article\.data\.category === id\)/);
  assert.match(homepage, /\.filter\(\(section\) => section\.articles\.length > 0\)/);
  assert.doesNotMatch(homepage, /No verified public story is available in this section yet/);
  assert.doesNotMatch(homepage, /এই বিভাগে এখনও কোনো যাচাইকৃত প্রকাশিত খবর নেই/);
});

test('search remains outside the homepage through navigation routes', () => {
  assert.match(homepage, /href=\{route\('articles'\)\}/);
  assert.doesNotMatch(homepage, /input type="search"/);
});
