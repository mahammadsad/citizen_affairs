import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const englishRoute = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const experience = await readFile('src/components/ArticleEntryExperience.astro', 'utf8');

const assertArticleFirstOrder = (route) => {
  const disclosure = route.indexOf('<ArticleEntryExperience');
  const content = route.indexOf('<Content />');
  const freshness = route.indexOf('<ArticleFreshnessNotice');
  const history = route.indexOf('<ArticleChangeHistory');

  assert.ok(content >= 0, 'article body should be rendered');
  assert.ok(disclosure > content, 'compact decision disclosure should follow the article body');
  assert.ok(freshness > disclosure, 'the detailed freshness panel should follow the decision disclosure');
  assert.ok(history > freshness, 'change history should remain after freshness information');
};

test('English and localized routes prioritize the article body', () => {
  assertArticleFirstOrder(englishRoute);
  assertArticleFirstOrder(localizedRoute);
});

test('secondary decision support uses one-level progressive disclosure', () => {
  assert.match(experience, /<details class="article-decision-disclosure"/);
  assert.match(experience, /data-article-decision-disclosure/);
  assert.match(experience, /Key facts and official links/);
  assert.match(experience, /গুরুত্বপূর্ণ তথ্য ও অফিসিয়াল লিংক/);
  assert.match(experience, /मुख्य तथ्य और आधिकारिक लिंक/);
  assert.match(experience, /location\.hash !== '#action-checklist'/);
});

test('mobile article chrome is compact without hiding trust information', () => {
  assert.match(experience, /\.trust-box\s*\{/);
  assert.match(experience, /grid-template-columns: minmax\(0, 1fr\) auto/);
  assert.match(experience, /\.article-actions\s*\{/);
  assert.match(experience, /position: static/);
  assert.match(experience, /@media \(max-width: 620px\)/);
  assert.doesNotMatch(experience, /\.trust-box\s*\{[^}]*display:\s*none/s);
});
