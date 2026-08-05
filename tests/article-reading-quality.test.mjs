import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const englishRoute = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const summary = await readFile('src/components/ArticleQuickSummary.astro', 'utf8');
const readingTools = await readFile('src/components/ArticleReadingTools.astro', 'utf8');
const qualityAudit = await readFile('scripts/audit-article-quality.mjs', 'utf8');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const styleGuide = await readFile('docs/multilingual-editorial-style.md', 'utf8');

const assertReadingOrder = (route) => {
  const quickSummary = route.indexOf('<ArticleQuickSummary');
  const content = route.indexOf('<Content />');
  const readingToolsIndex = route.indexOf('<ArticleReadingTools');
  const decisionWorkspace = route.indexOf('<ArticleEntryExperience');

  assert.ok(quickSummary >= 0, 'key points should render on article routes');
  assert.ok(quickSummary < content, 'key points should precede the full article');
  assert.ok(readingToolsIndex > content, 'long-article navigation should inspect the rendered article');
  assert.ok(decisionWorkspace > readingToolsIndex, 'secondary decision tools should remain below the story');
  assert.match(route, /quickSummary=\{\[\]\}/, 'the lower decision workspace must not duplicate key points');
};

test('English, Bengali and Hindi routes use the same content-first reading order', () => {
  assertReadingOrder(englishRoute);
  assertReadingOrder(localizedRoute);
});

test('key points are compact, multilingual and limited to three visible items', () => {
  assert.match(summary, /slice\(0, 3\)/);
  assert.match(summary, /Key points/);
  assert.match(summary, /মূল তথ্য/);
  assert.match(summary, /मुख्य बातें/);
  assert.match(summary, /article-quick-summary/);
});

test('long articles receive progressive contents navigation after the opening paragraph', () => {
  assert.match(readingTools, /headings\.length >= 4/);
  assert.match(readingTools, /firstParagraph\.insertAdjacentElement\('afterend', details\)/);
  assert.match(readingTools, /In this article/);
  assert.match(readingTools, /এই প্রতিবেদনে/);
  assert.match(readingTools, /इस लेख में/);
  assert.match(readingTools, /article-section-\$\{index \+ 1\}/);
});

test('public content validation includes multilingual writing-quality rules', () => {
  assert.equal(packageJson.scripts['audit:quality'], 'node scripts/audit-article-quality.mjs');
  assert.match(packageJson.scripts['validate:content'], /audit-article-quality\.mjs/);
  assert.match(qualityAudit, /quickSummary must contain 2 to 5 useful points/);
  assert.match(qualityAudit, /long article needs at least two descriptive H2 sections/);
  assert.match(qualityAudit, /headline uses clickbait wording/);
  assert.match(qualityAudit, /article-quality-report\.json/);
});

test('the editorial guide covers all three languages and verification boundaries', () => {
  assert.match(styleGuide, /## English/);
  assert.match(styleGuide, /## Bengali/);
  assert.match(styleGuide, /## Hindi/);
  assert.match(styleGuide, /Submission does not guarantee approval/);
  assert.match(styleGuide, /Do not hide the main fact/);
});
