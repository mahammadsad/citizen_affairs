import test from 'node:test';
import assert from 'node:assert/strict';

import { getShortLink, shortLinks } from '../src/lib/short-links.mjs';

test('branded short links use safe slugs and canonical article targets', () => {
  const seen = new Set();

  for (const entry of shortLinks) {
    assert.match(entry.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!seen.has(entry.slug), `duplicate short-link slug: ${entry.slug}`);
    seen.add(entry.slug);

    assert.ok(entry.target.startsWith('/'), `${entry.slug} must use a root-relative target`);
    assert.ok(entry.target.endsWith('/'), `${entry.slug} target must keep the canonical trailing slash`);
    assert.ok(entry.target.includes('/articles/'), `${entry.slug} must resolve to an article route`);
    assert.ok(!entry.target.includes('?'), `${entry.slug} target must not contain tracking parameters`);
    assert.ok(!entry.target.includes('#'), `${entry.slug} target must not contain a fragment`);
  }
});

test('current SBI and RRB share links resolve to the intended language routes', () => {
  assert.equal(getShortLink('sbi')?.target, '/articles/sbi-apprentice-result-2026/');
  assert.equal(getShortLink('sbi-bn')?.target, '/bn/articles/sbi-apprentice-result-2026/');
  assert.equal(getShortLink('sbi-hi')?.target, '/hi/articles/sbi-apprentice-result-2026/');

  assert.equal(getShortLink('rrb')?.target, '/articles/rrb-ntpc-ug-cbt-1-result-2026/');
  assert.equal(getShortLink('rrb-bn')?.target, '/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/');
  assert.equal(getShortLink('rrb-hi')?.target, '/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/');
});
