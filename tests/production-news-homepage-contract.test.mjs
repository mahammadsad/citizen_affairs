import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const production = await readFile('tests/production/production.spec.mjs', 'utf8');

test('production smoke verifies the news homepage instead of the removed hero search form', () => {
  assert.match(production, /page\.locator\('\.news-hero'\)/);
  assert.match(production, /page\.locator\('\.lead-story'\)/);
  assert.match(production, /page\.locator\('\.trending-section'\)/);
  assert.match(production, /page\.locator\('\.section-news-block'\)\)\.toHaveCount\(7\)/);
  assert.match(production, /page\.locator\('\.portal-search'\)\)\.toHaveCount\(0\)/);
  assert.doesNotMatch(production, /getByRole\('button', \{ name: \/search\|খুঁজুন\|खोजें\/i \}\)/);
});

test('production smoke keeps search discoverable through viewport-appropriate navigation', () => {
  assert.match(production, /\.portal-search-action\[href\*="\/search"\]/);
  assert.match(production, /\.portal-mobile-bottom a\[href\*="\/search"\]/);
  assert.match(production, /testInfo\.project\.name === 'mobile'/);
});

test('the content-rich Bengali homepage is checked after the language-neutral root', () => {
  assert.match(production, /page\.goto\(`\/bn\/\?build=/);
  assert.match(production, /await expect\(page\.locator\('\.lead-story'\)\)\.toBeVisible\(\)/);
  assert.match(production, /await expect\(page\.locator\('\.trending-section'\)\)\.toBeVisible\(\)/);
});
