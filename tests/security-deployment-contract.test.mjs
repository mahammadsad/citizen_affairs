import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');

test('production Pages deployment is not cancelled by a superseding run', () => {
  assert.match(workflow, /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/);
  assert.match(workflow, /timeout-minutes: 25/);
  assert.match(workflow, /timeout: 1200000/);
});

test('static CSP blocks inline attributes, frames and unapproved workers', () => {
  assert.match(baseLayout, /script-src-attr 'none'/);
  assert.match(baseLayout, /frame-src 'none'/);
  assert.match(baseLayout, /worker-src 'self'/);
  assert.match(baseLayout, /manifest-src 'self'/);
  assert.match(baseLayout, /media-src 'self'/);
  assert.match(baseLayout, /name="color-scheme" content="light dark"/);
});
