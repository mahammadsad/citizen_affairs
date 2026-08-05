import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = await readFile('playwright.production.config.mjs', 'utf8');

test('production smoke is serialized and does not hide failures behind retries', () => {
  assert.match(config, /workers:\s*1/);
  assert.match(config, /retries:\s*0/);
});
