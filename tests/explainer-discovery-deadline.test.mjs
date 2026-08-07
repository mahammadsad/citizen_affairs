import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const freshnessSource = await readFile(new URL('../src/lib/freshness.ts', import.meta.url), 'utf8');

test('evergreen explainers are not removed from discovery by a generic deadline', () => {
  assert.match(
    freshnessSource,
    /const deadlineCanExpireListing = data\.contentType !== 'explainer';/,
    'freshness policy must exempt explainer content from deadline-based listing expiry',
  );
  assert.match(
    freshnessSource,
    /deadlineCanExpireListing && deadlineTime !== undefined && deadlineTime < nowTime/,
    'deadline expiry must be gated by the content-type policy',
  );
});
