import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(path, 'utf8');
const deploy = await read('.github/workflows/deploy.yml');
const productionHealth = await read('.github/workflows/production-health.yml');
const dependencyReview = await read('.github/workflows/dependency-review.yml');
const dependabot = await read('.github/dependabot.yml');
const workflowValidator = await read('scripts/validate-workflows.mjs');
const packageJson = await read('package.json');
const ownerOperations = await read('docs/OWNER-OPERATIONS.md');
const troubleshooting = await read('docs/TROUBLESHOOTING.md');

const modernPins = {
  checkout: '3d3c42e5aac5ba805825da76410c181273ba90b1',
  setupNode: '820762786026740c76f36085b0efc47a31fe5020',
  uploadArtifact: '043fb46d1a93c77aae656e7c1c64a875d1fc6a0a',
  uploadPages: 'fc324d3547104276b827a68afc52ff2a11cc49c9',
  deployPages: 'cd2ce8fcbc39b97be8ca5fce6e763baed58fa128',
};

const deprecatedPins = [
  '34e114876b0b11c390a56381ad16ebd13914f8d5',
  '49933ea5288caeca8642d1e84afbd3f7d6820020',
  'ea165f8d65b6e75b540449e92b4886f43607fa02',
  '56afc609e74202658d3ffba0e8f6dda462b719fa',
  'd6db90164ac5ed86f2b6aed7e0febac5b3c0c03e',
];

test('production workflows use immutable current-runtime action pins', () => {
  for (const pin of Object.values(modernPins)) assert.match(deploy, new RegExp(pin));
  assert.match(productionHealth, new RegExp(modernPins.checkout));
  assert.match(productionHealth, new RegExp(modernPins.setupNode));
  assert.match(productionHealth, new RegExp(modernPins.uploadArtifact));
  for (const pin of deprecatedPins) {
    assert.doesNotMatch(deploy, new RegExp(pin));
    assert.doesNotMatch(productionHealth, new RegExp(pin));
  }
  assert.doesNotMatch(`${deploy}\n${productionHealth}`, /ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION|FORCE_JAVASCRIPT_ACTIONS_TO_NODE24/);
  assert.match(deploy, /node-version: "22"/);
});

test('all workflows receive a generated immutable-pin maintenance audit', () => {
  assert.match(workflowValidator, /\.github', 'workflows/);
  assert.match(workflowValidator, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(workflowValidator, /deprecatedPins/);
  assert.match(workflowValidator, /Forbidden runtime workaround/);
  assert.match(workflowValidator, /workflow-maintenance-report\.json/);
  assert.match(packageJson, /"validate:workflows": "node scripts\/validate-workflows\.mjs"/);
  assert.match(packageJson, /npm run validate:workflows/);
  assert.match(deploy, /Workflow maintenance validation/);
  assert.match(deploy, /workflow-maintenance-\$\{\{ github\.run_id \}\}/);
});

test('dependency updates are proposed weekly but never auto-merged', () => {
  assert.match(dependabot, /package-ecosystem: npm/);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.match(dependabot, /interval: weekly/g);
  assert.match(dependabot, /timezone: Asia\/Kolkata/g);
  assert.match(dependabot, /production-minor-patch/);
  assert.match(dependabot, /development-minor-patch/);
  assert.doesNotMatch(dependabot, /auto-merge|automerge/);
});

test('dependency-changing pull requests receive a read-only lockfile and high-severity gate', () => {
  assert.match(dependencyReview, /pull_request:/);
  assert.match(dependencyReview, /permissions:\n  contents: read/);
  assert.match(dependencyReview, new RegExp(modernPins.checkout));
  assert.match(dependencyReview, new RegExp(modernPins.setupNode));
  assert.match(dependencyReview, new RegExp(modernPins.uploadArtifact));
  assert.match(dependencyReview, /fetch-depth: 2/);
  assert.match(dependencyReview, /Verify lockfile integrity/);
  assert.match(dependencyReview, /npm ci/);
  assert.match(dependencyReview, /npm audit --audit-level=high --json/);
  assert.match(dependencyReview, /dependency-review-report\.json/);
  assert.doesNotMatch(dependencyReview, /contents: write|pull-requests: write/);
});

test('the owner runbook separates release evidence and documents safe recovery', () => {
  assert.match(ownerOperations, /\*\*Merged\*\*/);
  assert.match(ownerOperations, /\*\*Deployed\*\*/);
  assert.match(ownerOperations, /\*\*Verified live\*\*/);
  assert.match(ownerOperations, /production-smoke/);
  assert.match(ownerOperations, /reverts the problematic merge commit/);
  assert.match(ownerOperations, /Never rewrite or force-push `main`/);
  assert.match(ownerOperations, /Dependabot checks npm packages and GitHub Actions/);
  assert.match(troubleshooting, /Production smoke fails after deployment/);
  assert.match(troubleshooting, /Roll back a bad release/);
  assert.match(troubleshooting, /Do not manually upload the `dist` directory/);
});
