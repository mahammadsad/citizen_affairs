import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const constants = await readFile('src/utils/constants.ts', 'utf8');
const admin = await readFile('public/admin/index.html', 'utf8');
const brand = JSON.parse(await readFile('brand.config.json', 'utf8'));

test('legacy editorial artwork resolves to current Citizen Affairs branding', () => {
  assert.match(constants, /LEGACY_BRAND_ASSET_PREFIXES/);
  assert.match(constants, /uploads\/chatgpt-image-/);
  assert.match(constants, /uploads\/india-major-welfare-schemes-/);
  assert.match(constants, /relativePath = BRAND\.logoSocialCard/);
});

test('empty jobs and exams sections remain pending rather than promoted', () => {
  assert.doesNotMatch(JSON.stringify(brand.activeCategoryIds), /jobs/);
  assert.doesNotMatch(JSON.stringify(brand.activeCategoryIds), /exams/);
});

test('the public admin shell clearly reports the disconnected backend', () => {
  assert.match(admin, /noindex, nofollow, noarchive/);
  assert.match(admin, /Editorial backend disabled/);
  assert.match(admin, /contains no private drafts, credentials or database data/);
  assert.match(admin, /creates hidden drafts only/);
  assert.match(admin, /cannot publish directly/);
  assert.match(admin, /cannot approve content/);
});
