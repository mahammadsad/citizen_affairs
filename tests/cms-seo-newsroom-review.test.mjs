import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const cms = parse(await readFile('.pages.yml', 'utf8'));

const group = (name) => cms.content.find((entry) => entry.name === name);
const fieldMap = (collection) => new Map(collection.fields.map((field) => [field.name, field]));

test('Pages CMS exposes a dedicated SEO and newsroom review workspace for every locale', () => {
  const seoGroup = group('seo-newsroom-review');
  assert.ok(seoGroup, 'SEO newsroom review group must exist');
  assert.equal(seoGroup.type, 'group');
  assert.match(seoGroup.label, /SEO & Newsroom review/);
  assert.equal(seoGroup.items.length, 3);

  const draftGroup = group('draft-articles');
  assert.ok(draftGroup, 'draft group must exist');

  const expected = [
    ['english-seo-review', 'english-drafts'],
    ['bengali-seo-review', 'bengali-drafts'],
    ['hindi-seo-review', 'hindi-drafts'],
  ];

  for (const [seoName, draftName] of expected) {
    const seoCollection = seoGroup.items.find((item) => item.name === seoName);
    const draftCollection = draftGroup.items.find((item) => item.name === draftName);
    assert.ok(seoCollection, `${seoName} must exist`);
    assert.ok(draftCollection, `${draftName} must exist`);
    assert.equal(seoCollection.path, draftCollection.path, `${seoName} must edit the same draft files`);
    assert.deepEqual(seoCollection.operations, { create: false, rename: false, delete: false });

    const fields = fieldMap(seoCollection);
    for (const requiredField of [
      'workflowStatus',
      'title',
      'urlSlug',
      'contentType',
      'category',
      'verificationStatus',
      'seoTitle',
      'seoDescription',
      'tags',
      'quickSummary',
      'featuredImage',
      'featuredImageAlt',
      'sourceUrls',
      'sources',
      'officialNoticeUrl',
      'applicationUrl',
      'lastVerified',
      'faqs',
    ]) {
      assert.ok(fields.has(requiredField), `${seoName} must expose ${requiredField}`);
    }

    assert.equal(fields.get('workflowStatus').readonly, true);
    assert.equal(fields.get('title').readonly, true);
    assert.equal(fields.get('urlSlug').readonly, true);
    assert.equal(fields.has('body'), false, `${seoName} stays focused on pre-publication SEO review`);

    const sources = fields.get('sources');
    assert.equal(sources.type, 'object');
    assert.ok(sources.list, 'structured sources must remain a list');
    const sourceFields = new Set(sources.fields.map((field) => field.name));
    for (const sourceField of [
      'title',
      'url',
      'publishingAuthority',
      'sourceType',
      'designation',
      'accessedDate',
    ]) {
      assert.ok(sourceFields.has(sourceField), `structured sources must expose ${sourceField}`);
    }
  }
});

test('CMS merge mode preserves frontmatter fields hidden from focused editors', () => {
  assert.equal(cms.settings?.content?.merge, true);
});
