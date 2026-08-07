import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const production = await readFile('tests/production/production.spec.mjs', 'utf8');

test('production smoke verifies the professional news homepage', () => {
  assert.match(production, /page\.locator\('\.top-news'\)/);
  assert.match(production, /page\.locator\('\.lead-story'\)/);
  assert.match(production, /page\.locator\('\.latest-rail'\)/);
  assert.match(
    production,
    /expect\(await page\.locator\('\.news-section-block'\)\.count\(\)\)\.toBeGreaterThan\(0\)/,
  );
  assert.match(production, /page\.locator\('\.trending-section'\)\)\.toHaveCount\(0\)/);
  assert.match(production, /page\.locator\('\.section-empty'\)\)\.toHaveCount\(0\)/);
  assert.match(production, /page\.locator\('\.portal-search'\)\)\.toHaveCount\(0\)/);
  assert.doesNotMatch(production, /page\.locator\('\.news-hero'\)/);
  assert.doesNotMatch(production, /page\.locator\('\.section-news-block'\)\)\.toHaveCount\(7\)/);
  assert.doesNotMatch(production, /getByRole\('button', \{ name: \/search\|খুঁজুন\|खोजें\/i \}\)/);
});

test('production smoke keeps search discoverable through viewport-appropriate navigation', () => {
  assert.match(production, /\.portal-search-action\[href\*="\/search"\]/);
  assert.match(production, /portal-mobile-utility-link\[href\*="\/search"\]/);
  assert.match(production, /portal-mobile-utility-link\[href\*="\/saved"\]/);
  assert.match(production, /page\.locator\('\.portal-mobile-bottom'\)\)\.toBeHidden\(\)/);
  assert.match(production, /testInfo\.project\.name === 'mobile'/);
});

test('the content-rich Bengali homepage is checked after the language-neutral root', () => {
  assert.match(production, /page\.goto\(\s*`\/bn\/\?build=/);
  assert.match(production, /await expect\(page\.locator\('\.top-news'\)\)\.toBeVisible\(\)/);
  assert.match(production, /await expect\(page\.locator\('\.lead-story'\)\)\.toBeVisible\(\)/);
  assert.match(production, /await expect\(page\.locator\('\.latest-rail'\)\)\.toBeVisible\(\)/);
  assert.match(production, /page\.locator\('\.trending-section'\)\)\.toHaveCount\(0\)/);
  assert.match(production, /page\.locator\('\.section-empty'\)\)\.toHaveCount\(0\)/);
});
