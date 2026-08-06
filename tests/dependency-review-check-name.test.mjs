import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile('.github/workflows/dependency-review.yml', 'utf8');

test('dependency review job reports the exact protected status-check name', () => {
  assert.match(
    workflow,
    /jobs:\s*\n\s{2}dependency-review:\s*\n\s{4}name: Dependency Review/,
  );
});
