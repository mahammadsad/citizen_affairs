import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile('.github/workflows/cms-publish.yml', 'utf8');

test('Pages CMS wakes for main updates and preserves in-flight CMS edits', () => {
  assert.match(
    workflow,
    /push:\s*\n(?:\s*#.*\n)*\s*branches:\s*\[cms, main\]/,
    'main pushes must wake the CMS synchronization workflow',
  );
  assert.match(workflow, /ref:\s*cms/, 'the workflow must continue operating on the CMS branch');
  assert.match(workflow, /git fetch origin main/);
  assert.match(
    workflow,
    /git merge --no-edit origin\/main/,
    'main must be merged into CMS rather than blindly replacing CMS history',
  );
  assert.match(workflow, /git merge --abort \|\| true/);
  assert.match(workflow, /git push origin HEAD:cms/);
  assert.match(
    workflow,
    /git diff --name-only origin\/main\.\.\.HEAD/,
    'only CMS changes that remain after synchronization may enter the publication path',
  );
});
