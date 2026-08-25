import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  articleShortCode,
  articleTargetPath,
  getPreferredShortLink,
  getShortLink,
  shortLinks,
  shortPathForArticle,
} from '../src/lib/short-links.mjs';

test('curated branded short links use safe slugs and canonical article targets', () => {
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

test('current SBI and RRB share links keep their human-friendly aliases', () => {
  assert.equal(getShortLink('sbi')?.target, '/articles/sbi-apprentice-result-2026/');
  assert.equal(getShortLink('sbi-bn')?.target, '/bn/articles/sbi-apprentice-result-2026/');
  assert.equal(getShortLink('sbi-hi')?.target, '/hi/articles/sbi-apprentice-result-2026/');

  assert.equal(getShortLink('rrb')?.target, '/articles/rrb-ntpc-ug-cbt-1-result-2026/');
  assert.equal(getShortLink('rrb-bn')?.target, '/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/');
  assert.equal(getShortLink('rrb-hi')?.target, '/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/');

  assert.equal(shortPathForArticle('en', 'sbi-apprentice-result-2026'), '/go/sbi/');
  assert.equal(shortPathForArticle('bn', 'sbi-apprentice-result-2026'), '/go/sbi-bn/');
  assert.equal(shortPathForArticle('hi', 'rrb-ntpc-ug-cbt-1-result-2026'), '/go/rrb-hi/');
});

test('future articles receive deterministic automatic short codes in every language', () => {
  const slug = 'example-future-recruitment-2026';
  const enCode = articleShortCode('en', slug);
  const bnCode = articleShortCode('bn', slug);
  const hiCode = articleShortCode('hi', slug);

  assert.match(enCode, /^a[a-z0-9]+$/);
  assert.equal(enCode, articleShortCode('en', slug));
  assert.notEqual(enCode, bnCode);
  assert.notEqual(enCode, hiCode);
  assert.notEqual(bnCode, hiCode);

  assert.equal(articleTargetPath('en', slug), `/articles/${slug}/`);
  assert.equal(articleTargetPath('bn', slug), `/bn/articles/${slug}/`);
  assert.equal(articleTargetPath('hi', slug), `/hi/articles/${slug}/`);
  assert.equal(shortPathForArticle('en', slug), `/go/${enCode}/`);
});

test('automatic links never override a curated alias for the same article', () => {
  const preferred = getPreferredShortLink('en', 'sbi-apprentice-result-2026');
  assert.equal(preferred.slug, 'sbi');
  assert.equal(preferred.target, '/articles/sbi-apprentice-result-2026/');

  const generated = getPreferredShortLink('en', 'example-future-recruitment-2026');
  assert.match(generated.slug, /^a[a-z0-9]+$/);
  assert.equal(generated.target, '/articles/example-future-recruitment-2026/');
});

test('unsafe article locales and slugs are rejected before redirect generation', () => {
  assert.throws(() => articleTargetPath('fr', 'safe-slug'), /Unsupported article locale/);
  assert.throws(() => articleTargetPath('en', '../unsafe'), /Unsafe article slug/);
  assert.throws(() => articleTargetPath('en', 'unsafe?tracking=1'), /Unsafe article slug/);
});

test('article share runtime routes social, native and copy actions through short links', async () => {
  const runtime = await readFile(new URL('../src/components/PortalRuntime.astro', import.meta.url), 'utf8');

  assert.match(runtime, /shortPathForArticle/);
  assert.match(runtime, /syncShortShareLinks/);
  assert.match(runtime, /navigator\.share/);
  assert.match(runtime, /copyText\(context\.shortUrl\)/);
  assert.match(runtime, /addEventListener\('click', handleShortShareClick, true\)/);
});
