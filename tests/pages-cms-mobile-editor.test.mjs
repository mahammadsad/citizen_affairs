import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const cmsSource = await readFile('.pages.yml', 'utf8');
const cms = parse(cmsSource);
const adminPage = await readFile('public/admin/index.html', 'utf8');

test('Pages CMS exposes a keyboard-friendly mobile draft editor for every language', () => {
  const mobileGroup = cms.content.find((entry) => entry.name === 'mobile-draft-editor');
  assert.ok(mobileGroup, 'mobile draft editor group must exist');
  assert.equal(mobileGroup.items.length, 3);

  const expected = {
    'english-drafts-mobile': 'src/content/articles/en/drafts',
    'bengali-drafts-mobile': 'src/content/articles/bn/drafts',
    'hindi-drafts-mobile': 'src/content/articles/hi/drafts',
  };

  for (const collection of mobileGroup.items) {
    assert.equal(collection.path, expected[collection.name]);
    assert.equal(collection.subfolders, false);
    assert.deepEqual(collection.operations, { create: false, rename: false, delete: false });

    const body = collection.fields.find((field) => field.name === 'body');
    assert.ok(body, `${collection.name} must expose the article body`);
    assert.equal(body.type, 'text', `${collection.name} must avoid the rich-text floating toolbar`);
    assert.equal(body.required, true);

    for (const field of collection.fields.filter((field) => field.name !== 'body')) {
      assert.equal(field.readonly, true, `${collection.name}:${field.name} must remain read-only in mobile mode`);
    }
  }

  assert.equal(cms.settings.content.merge, true, 'mobile body-only saves must preserve unmanaged article metadata');
});

test('owner admin page sends phone editors to the keyboard-friendly collection', () => {
  assert.match(adminPage, /Mobile draft editor — KEYBOARD FRIENDLY/i);
  assert.match(adminPage, /english-drafts-mobile/);
  assert.match(adminPage, /Open mobile-friendly English drafts/i);
  assert.match(adminPage, /Copy\/Paste menu/i);
  assert.match(adminPage, /Protected publication remains separate/i);
});
