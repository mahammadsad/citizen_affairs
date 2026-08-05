import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const articlePath = 'src/content/articles/bn/use-digilocker-education-documents-safely.md';
const reviewPath = 'docs/editorial-reviews/2026-08-05-digilocker-education-documents-guide.md';
const article = await readFile(articlePath, 'utf8');
const review = await readFile(reviewPath, 'utf8');

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  assert.ok(match, 'article should have YAML frontmatter');
  return parse(match[1]);
}

const data = frontmatter(article);

test('DigiLocker guide is a controlled partially confirmed publication', () => {
  assert.equal(data.workflowStatus, 'published');
  assert.equal(data.verificationStatus, 'partially-confirmed');
  assert.equal(data.draft, false);
  assert.equal(data.featured, false);
  assert.equal(String(data.lastVerified), '2026-08-05');
  assert.equal(String(data.nextReviewDate), '2026-09-05');
  assert.ok(Array.isArray(data.sources) && data.sources.length >= 5);
  assert.ok(data.sources.every((entry) => entry.designation === 'primary'));
});

test('DigiLocker guide separates issued and uploaded document provenance', () => {
  assert.match(article, /Issued document:.*issuer-এর original data source/s);
  assert.match(article, /Uploaded document:.*personal storage/s);
  assert.match(article, /upload করলেই documentটি issuer-verified হয়ে যায় না/);
});

test('legal validity does not override institution-specific instructions', () => {
  assert.match(article, /issuer কর্তৃক জারি করা digital document/);
  assert.match(article, /প্রতিটি institution একই upload field, file format বা submission process ব্যবহার করবে/);
  assert.match(article, /সংশ্লিষ্ট authority-এর current notice/);
  assert.doesNotMatch(article, /সব institution বাধ্যতামূলকভাবে DigiLocker document গ্রহণ করবে/);
});

test('official QR verification and privacy boundaries are protected', () => {
  assert.ok(data.sourceUrls.includes('https://verify.digilocker.gov.in/'));
  assert.ok(data.sourceUrls.includes('https://www.digilocker.gov.in/web/about/tos'));
  assert.ok(data.sourceUrls.includes('https://nad.digilocker.gov.in/faq'));
  assert.ok(data.sourceUrls.every((value) => !value.includes('/web/case-study')));
  assert.match(article, /QR code public social media-তে পোস্ট করবেন না/);
  assert.match(article, /NeGD কোনো fee নেয় না/);
});

test('editorial review records the verification and acceptance boundaries', () => {
  assert.match(review, /Issued and uploaded documents are not the same/);
  assert.match(review, /Legal-validity wording needs a boundary/);
  assert.match(review, /QR verification/);
  assert.match(review, /partially-confirmed/);
  assert.match(review, /exact deployed commit must pass production smoke verification/);
});
