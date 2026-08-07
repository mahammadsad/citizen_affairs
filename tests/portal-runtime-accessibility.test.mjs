import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtimePath = new URL('../src/components/PortalRuntime.astro', import.meta.url);

test('details-based portal disclosures expose button semantics and expanded state', async () => {
  const source = await readFile(runtimePath, 'utf8');

  assert.match(source, /\.portal-language > summary/);
  assert.match(source, /\.portal-more > summary/);
  assert.doesNotMatch(source, /\.portal-mobile-menu > summary/);
  assert.match(source, /summary\.setAttribute\('role', 'button'\)/);
  assert.match(source, /summary\.setAttribute\('aria-expanded'/);
  assert.match(source, /details\.addEventListener\('toggle', syncExpanded\)/);
});
