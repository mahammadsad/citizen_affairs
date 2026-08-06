import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const status = JSON.parse(await readFile('project-status.json', 'utf8'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const brand = JSON.parse(await readFile('brand.config.json', 'utf8'));

const astroMajor = Number(String(packageJson.dependencies.astro).match(/\d+/)?.[0] || 0);

test('project status matches the deployed framework and domain configuration', () => {
  assert.equal(status.framework.name, 'Astro');
  assert.equal(status.framework.major, astroMajor);
  assert.equal(status.productionDomain, brand.domain);
});

test('project status matches configured and promoted category states', () => {
  assert.deepEqual(status.configuredCategoryIds, brand.configuredCategoryIds);
  assert.deepEqual(status.activeCategoryIds, brand.activeCategoryIds);
  assert.equal(status.editorialBackend, 'disabled');
  assert.ok(status.pendingCategoryIds.includes('jobs'));
  assert.ok(status.pendingCategoryIds.includes('exams'));
  assert.ok(status.configuredCategoryIds.includes('jobs'));
  assert.ok(status.configuredCategoryIds.includes('exams'));
  assert.ok(!status.activeCategoryIds.includes('jobs'));
  assert.ok(!status.activeCategoryIds.includes('exams'));
});
