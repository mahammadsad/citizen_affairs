import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const categoryPortal = await readFile('src/components/CategoryPortal.astro', 'utf8');
const localizedCategoryRoute = await readFile('src/pages/[lang]/categories/[category].astro', 'utf8');

test('localized category routes use the task-focused category portal', () => {
  assert.match(localizedCategoryRoute, /import CategoryPortal from '@components\/CategoryPortal\.astro'/);
  assert.match(localizedCategoryRoute, /<CategoryPortal \{locale\} \{category\} \{articles\} \/>/);
  assert.doesNotMatch(localizedCategoryRoute, /listing-hero/);
});

test('category portal provides localized guidance and useful summary counts', () => {
  assert.match(categoryPortal, /Before you take action/);
  assert.match(categoryPortal, /কোনো পদক্ষেপ নেওয়ার আগে/);
  assert.match(categoryPortal, /कार्रवाई करने से पहले/);
  assert.match(categoryPortal, /officialCount/);
  assert.match(categoryPortal, /actionableCount/);
  assert.match(categoryPortal, /centralCount/);
  assert.match(categoryPortal, /stateCount/);
  assert.match(categoryPortal, /<ArticleCard \{article\} \{locale\} \/>/);
});

test('category filters remain accessible and update result visibility without navigation', () => {
  assert.match(categoryPortal, /role="group"/);
  assert.match(categoryPortal, /aria-pressed="true"/);
  assert.match(categoryPortal, /aria-live="polite"/);
  assert.match(categoryPortal, /data-category-filter="official"/);
  assert.match(categoryPortal, /data-category-filter="open"/);
  assert.match(categoryPortal, /data-category-filter="central"/);
  assert.match(categoryPortal, /data-category-filter="state"/);
  assert.match(categoryPortal, /card\.hidden = !visible/);
  assert.match(categoryPortal, /noMatch\.hidden = visibleCount !== 0/);
});
