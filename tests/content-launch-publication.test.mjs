import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const paths = {
  job: 'src/content/articles/bn/verify-government-job-notice-officially.md',
  exam: 'src/content/articles/bn/check-exam-admit-card-result-officially.md',
  welfareEn: 'src/content/articles/en/india-major-welfare-schemes-official-guide.md',
  welfareHi: 'src/content/articles/hi/india-major-welfare-schemes-official-guide.md',
};

const files = Object.fromEntries(
  await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, 'utf8')])),
);

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  assert.ok(match, 'article should have YAML frontmatter');
  return parse(match[1]);
}

const data = Object.fromEntries(Object.entries(files).map(([key, source]) => [key, frontmatter(source)]));

test('verification guides are public with a bounded verification state', () => {
  for (const key of ['job', 'exam']) {
    assert.equal(data[key].workflowStatus, 'published');
    assert.equal(data[key].verificationStatus, 'partially-confirmed');
    assert.equal(data[key].draft, false);
    assert.equal(String(data[key].lastVerified), '2026-08-06');
    assert.equal(String(data[key].nextReviewDate), '2026-09-06');
    assert.ok(data[key].sources.length >= 6);
    assert.ok(data[key].sources.every((source) => source.designation === 'primary'));
    assert.doesNotMatch(files[key], /লুকানো খসড়া/);
  }
});

test('government job guide preserves official-notice and fraud-reporting safeguards', () => {
  assert.match(files.job, /Official Notice Board/);
  assert.match(files.job, /corrigendum/);
  assert.match(files.job, /personal UPI ID/);
  assert.match(files.job, /1930/);
  assert.match(files.job, /National Cyber Crime Reporting Portal/);
});

test('exam guide distinguishes exam documents and DigiLocker document types', () => {
  assert.match(files.exam, /city intimation slip-কে admit card নয়/);
  assert.match(files.exam, /Provisional answer key/);
  assert.match(files.exam, /Recorded response/);
  assert.match(files.exam, /Issued Documents/);
  assert.match(files.exam, /user-uploaded file এবং issuer-provided document এক নয়/);
});

test('welfare translations preserve the reviewed Bengali source boundary', () => {
  for (const key of ['welfareEn', 'welfareHi']) {
    assert.equal(data[key].translationKey, 'india-major-welfare-schemes-official-guide');
    assert.equal(data[key].workflowStatus, 'published');
    assert.equal(data[key].verificationStatus, 'partially-confirmed');
    assert.equal(data[key].draft, false);
    assert.equal(data[key].sourceUrls.length, 22);
    assert.ok(data[key].sources.length >= 8);
    assert.match(files[key], /30 September 2026|30 सितंबर 2026/);
    assert.match(files[key], /Samagra Shiksha/);
    assert.doesNotMatch(files[key], /PM POSHAN.*2030-31|PM POSHAN.*2030–31/s);
  }
});
