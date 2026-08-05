import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const configuration = await readFile('playwright.production.config.mjs', 'utf8');

test('production offline verification uses one isolated browser project', () => {
  assert.match(configuration, /const offlineFallbackTest = \/live service worker provides the multilingual offline fallback\//);
  assert.match(configuration, /name: 'desktop',[\s\S]*?grepInvert: offlineFallbackTest/);
  assert.match(configuration, /name: 'mobile',[\s\S]*?grepInvert: offlineFallbackTest/);
  assert.match(configuration, /name: 'offline',[\s\S]*?grep: offlineFallbackTest/);
  assert.match(configuration, /name: 'offline',[\s\S]*?devices\['Desktop Chrome'\]/);
});

test('production verification remains serial and does not retry failures', () => {
  assert.match(configuration, /workers: 1/);
  assert.match(configuration, /retries: 0/);
});
