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
