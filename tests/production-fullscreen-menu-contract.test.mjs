import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const production = await readFile('tests/production/production.spec.mjs', 'utf8');

test('production checks the primary navbar brand instead of counting every menu logo', () => {
  assert.doesNotMatch(production, /header img\[alt\*=["']Citizen Affairs["']\]/);
  assert.match(production, /\.portal-navbar \.portal-brand > img\[alt\*=["']Citizen Affairs["']\]/);
});

test('production opens and verifies the live full-screen mobile menu', () => {
  assert.match(production, /portal-mobile-menu-search input\[name=["']q["']\]/);
  assert.match(production, /portal-mobile-brand-logo/);
  assert.match(production, /aria-modal/);
  assert.match(production, /geometry\.right - geometry\.viewportWidth/);
  assert.match(production, /geometry\.bottom - geometry\.viewportHeight/);
  assert.match(production, /keyboard\.press\(["']Escape["']\)/);
});
