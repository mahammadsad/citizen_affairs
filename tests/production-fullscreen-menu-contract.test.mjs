import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const production = await readFile('tests/production/production.spec.mjs', 'utf8');

test('production checks the primary navbar brand instead of counting every menu logo', () => {
  assert.doesNotMatch(production, /header img\[alt\*=["']Citizen Affairs["']\]/);
  assert.match(production, /\.portal-navbar \.portal-brand > img\[alt\*=["']Citizen Affairs["']\]/);
});

test('production opens and verifies the live expanding mobile menu', () => {
  assert.match(production, /portal-mobile-trigger/);
  assert.match(production, /portal-mobile-panel/);
  assert.match(production, /aria-expanded/);
  assert.match(production, /after\.top - before\.top/);
  assert.match(production, /keyboard\.press\(["']Escape["']\)/);
  assert.doesNotMatch(production, /aria-modal/);
});
