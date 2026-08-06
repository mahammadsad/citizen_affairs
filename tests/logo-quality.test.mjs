import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('header logo uses the official high-resolution artwork instead of traced paths', () => {
  const component = read('src/components/BrandLogo.astro');
  const light = read('public/assets/brand/citizen-affairs-horizontal-quality-v2.svg');
  const dark = read('public/assets/brand/citizen-affairs-horizontal-quality-dark-v2.svg');

  assert.match(component, /citizen-affairs-horizontal-quality-v2\.svg/);
  assert.match(component, /citizen-affairs-horizontal-quality-dark-v2\.svg/);
  assert.match(component, /image-rendering:\s*auto/);
  assert.match(light, /citizen-affairs-horizontal\.png/);
  assert.match(dark, /citizen-affairs-horizontal\.png/);
  assert.doesNotMatch(light, /<path\b/);
  assert.doesNotMatch(light, /<text\b/);
});
