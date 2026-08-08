import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const reviewWorkflow = await readFile('.github/workflows/generate-review-drafts.yml', 'utf8');
const legacyWorkflow = await readFile('.github/workflows/generate-drafts.yml', 'utf8');

test('review workflow is the only scheduled repository draft generator', () => {
  assert.match(reviewWorkflow, /schedule:/);
  assert.match(reviewWorkflow, /MAX_DRAFTS_PER_RUN:\s*"1"/);
  assert.match(reviewWorkflow, /EDITORIAL_GITHUB_TOKEN/);
  assert.match(reviewWorkflow, /gh pr create[\s\S]*--draft/);
  assert.match(reviewWorkflow, /No auto-merge is permitted/);
  assert.doesNotMatch(reviewWorkflow, /gh pr merge/);
  assert.match(reviewWorkflow, /draft:\[\[:space:\]\]\*true/);
  assert.match(reviewWorkflow, /src\/content\/articles\/\*\/drafts\/\*\.md/);
  assert.match(reviewWorkflow, /src\/content\/articles\/en\/drafts\/\*\.md/);

  assert.doesNotMatch(legacyWorkflow, /schedule:/);
  assert.doesNotMatch(legacyWorkflow, /workflow_dispatch:/);
  assert.doesNotMatch(legacyWorkflow, /git push origin HEAD:main/);
  assert.doesNotMatch(legacyWorkflow, /python -m app\.cli generate-drafts/);
});
