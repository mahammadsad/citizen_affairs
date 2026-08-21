import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const categoryPortal = await readFile('src/components/CategoryPortal.astro', 'utf8');
const localizedCategoryRoute = await readFile('src/pages/[lang]/categories/[category].astro', 'utf8');

test('localized category routes use the task-focused category portals', () => {
  assert.match(localizedCategoryRoute, /import CategoryPortal from '@components\/CategoryPortal\.astro'/);
  assert.match(localizedCategoryRoute, /import GovernmentJobsPortal from '@components\/GovernmentJobsPortal\.astro'/);
  assert.match(localizedCategoryRoute, /category\.id === 'jobs'/);
  assert.match(localizedCategoryRoute, /<GovernmentJobsPortal \{locale\} \{category\} \{articles\} \/>/);
  assert.match(localizedCategoryRoute, /<CategoryPortal \{locale\} \{category\} \{articles\} \/>/);
  assert.doesNotMatch(localizedCategoryRoute, /listing-hero/);
});

test('generic category portal is an editorial section rather than a dashboard', () => {
  assert.match(categoryPortal, /category-hero/);
  assert.match(categoryPortal, /category-description/);
  assert.match(categoryPortal, /officialCount/);
  assert.match(categoryPortal, /actionableCount/);
  assert.match(categoryPortal, /centralCount/);
  assert.match(categoryPortal, /stateCount/);
  assert.match(categoryPortal, /<ArticleCard \{article\} \{locale\} \/>/);
  assert.doesNotMatch(categoryPortal, /category-trust/);
  assert.doesNotMatch(categoryPortal, /category-summary/);
  assert.doesNotMatch(categoryPortal, /Before you take action/);
});

test('generic category filters remain accessible and update result visibility without navigation', () => {
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