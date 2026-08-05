import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const articlePath = 'src/content/articles/bn/india-major-welfare-schemes-official-guide.md';
const reviewPath = 'docs/editorial-reviews/2026-08-05-major-welfare-schemes-guide.md';
const article = await readFile(articlePath, 'utf8');
const review = await readFile(reviewPath, 'utf8');

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  assert.ok(match, 'article should have YAML frontmatter');
  return parse(match[1]);
}

const data = frontmatter(article);

test('public welfare guide records the current review boundary', () => {
  assert.equal(data.workflowStatus, 'published');
  assert.equal(data.verificationStatus, 'partially-confirmed');
  assert.equal(data.draft, false);
  assert.equal(String(data.updated), '2026-08-05');
  assert.equal(String(data.lastVerified), '2026-08-05');
  assert.equal(String(data.nextReviewDate), '2026-09-05');
  assert.ok(Array.isArray(data.sources) && data.sources.length >= 8);
  assert.ok(data.sources.every((entry) => entry.designation === 'primary'));
});

test('welfare guide uses only government primary sources', () => {
  assert.ok(Array.isArray(data.sourceUrls) && data.sourceUrls.length >= 20);
  assert.ok(data.sourceUrls.every((value) => new URL(value).protocol === 'https:'));
  assert.ok(data.sourceUrls.every((value) => !value.includes('accountabilityindia.in')));
  assert.doesNotMatch(article, /accountabilityindia\.in/);
});

test('PM POSHAN temporary continuation is stated without a false long-term approval', () => {
  assert.match(article, /৩০ সেপ্টেম্বর ২০২৬ অথবা নতুন approval-এর তারিখ—যেটি আগে—পর্যন্ত/);
  assert.match(article, /অস্থায়ী continuation/);
  assert.doesNotMatch(article, /PM POSHAN.*২০৩০-৩১ পর্যন্ত অনুমোদিত/s);
});

test('Samagra Shiksha implementation and approval are kept distinct', () => {
  assert.match(article, /২০২৬-২৭ planning/);
  assert.match(article, /পূর্ণ নতুন বহু-বছরের Cabinet\/CCEA approval না দেখে/);
  assert.doesNotMatch(article, /Samagra Shiksha.*২০৩০-৩১ পর্যন্ত অনুমোদিত/s);
});

test('editorial review records material findings and verification limits', () => {
  assert.match(review, /PM POSHAN/);
  assert.match(review, /Samagra Shiksha/);
  assert.match(review, /non-government source/);
  assert.match(review, /partially-confirmed/);
  assert.match(review, /exact deployed commit must pass production smoke verification/);
});
