import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const registry = JSON.parse(await readFile('src/data/editorial-assets.json', 'utf8'));
const validator = await readFile('scripts/validate-editorial-assets.mjs', 'utf8');

test('owned editorial assets record provenance, AI use and human review state', () => {
  assert.equal(registry.assets.length, 2);
  for (const asset of registry.assets) {
    for (const field of ['creatorSource', 'licence', 'aiAssisted', 'createdAt', 'editorialOwner', 'lastVisualReview', 'reviewStatus', 'reviewer']) assert.ok(asset[field] !== undefined, `${asset.id} needs ${field}`);
    assert.equal(asset.humanOwnerApprovalRequiredBeforePublish, true);
    assert.equal(asset.mobile390Reviewed, true);
    assert.equal(asset.desktop1440Reviewed, true);
  }
});

test('asset validator blocks text, domains, retired brands and unregistered derivatives', () => {
  assert.match(validator, /<text\\b/);
  assert.match(validator, /illustratedDomain/);
  assert.match(validator, /Sarkari Tathya Kendra/);
  assert.match(validator, /is not registered/);
  assert.match(validator, /human owner visual approval is still required/);
});
