import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const productionTest = await readFile('tests/production/production.spec.mjs', 'utf8');

test('production status labels use exact semantic matches', () => {
  assert.match(productionTest, /getByText\('Merged target', \{ exact: true \}\)/);
  assert.match(productionTest, /getByText\('Served deployment', \{ exact: true \}\)/);
  assert.match(productionTest, /getByText\('Verified live', \{ exact: true \}\)/);
});

test('live article schema verification runs once instead of duplicating browser load', () => {
  assert.match(
    productionTest,
    /published article is available when sitemap lists one[\s\S]*test\.skip\(testInfo\.project\.name !== 'desktop'/
  );
});

test('live article schema verification is request-only and cannot close a browser context', () => {
  const articleCheck = productionTest.match(
    /test\('published article is available when sitemap lists one'[\s\S]*?\n\}\);/
  )?.[0];

  assert.ok(articleCheck, 'article verification block should exist');
  assert.match(productionTest, /const extractJsonLd =/);
  assert.match(articleCheck, /async \(\{ request \}, testInfo\)/);
  assert.match(articleCheck, /request\.get\(`/);
  assert.match(articleCheck, /extractJsonLd\(await response\.text\(\)\)/);
  assert.doesNotMatch(articleCheck, /\bpage\b/);
  assert.doesNotMatch(articleCheck, /browser\.newContext/);
});
