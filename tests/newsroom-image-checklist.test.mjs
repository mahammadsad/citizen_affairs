import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const contentSchema = await readFile('src/content.config.ts', 'utf8');
const structuredData = await readFile('src/components/ArticleStructuredData.astro', 'utf8');
const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');
const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const cms = parse(await readFile('.pages.yml', 'utf8'));

test('article schema stores newsroom image attribution and editorial checklist metadata', () => {
  for (const field of [
    'featuredImageCaption',
    'featuredImageCredit',
    'featuredImageCreditUrl',
    'newsroomChecklist',
    'headlineReviewed',
    'metaReviewed',
    'imageReviewed',
    'sourcesReviewed',
    'internalLinksReviewed',
    'factualClaimsReviewed',
  ]) {
    assert.match(contentSchema, new RegExp(field));
  }
});

test('image structured data prefers editorial caption and carries credit text', () => {
  assert.match(structuredData, /featuredImageCaption \|\| data\.featuredImageAlt \|\| data\.title/);
  assert.match(structuredData, /creditText: data\.featuredImageCredit/);
});

test('social image metadata supports article-specific alt text and dimensions', () => {
  assert.match(baseLayout, /imageAlt\?: string/);
  assert.match(baseLayout, /imageWidth\?: number/);
  assert.match(baseLayout, /imageHeight\?: number/);
  assert.match(baseLayout, /ogType === 'article' \? resolvedTitle/);
  assert.match(baseLayout, /og:image:width/);
  assert.match(baseLayout, /String\(imageWidth\)/);
  assert.match(mainLayout, /imageAlt\?: string/);
  assert.match(mainLayout, /\{imageAlt\}/);
  assert.match(mainLayout, /\{imageWidth\}/);
  assert.match(mainLayout, /\{imageHeight\}/);
});

test('every SEO newsroom collection exposes image attribution and the same review checklist', () => {
  const group = cms.content.find((entry) => entry.name === 'seo-newsroom-review');
  assert.ok(group);
  assert.equal(group.items.length, 3);

  const requiredChecklistFields = [
    'headlineReviewed',
    'metaReviewed',
    'imageReviewed',
    'sourcesReviewed',
    'internalLinksReviewed',
    'factualClaimsReviewed',
  ];

  for (const collection of group.items) {
    const fields = new Map(collection.fields.map((field) => [field.name, field]));
    for (const field of [
      'featuredImageCaption',
      'featuredImageCredit',
      'featuredImageCreditUrl',
      'newsroomChecklist',
    ]) {
      assert.ok(fields.has(field), `${collection.name} must expose ${field}`);
    }

    const checklist = fields.get('newsroomChecklist');
    assert.equal(checklist.type, 'object');
    assert.equal(checklist.required, false);
    const checklistFields = new Map(checklist.fields.map((field) => [field.name, field]));
    for (const name of requiredChecklistFields) {
      assert.ok(checklistFields.has(name), `${collection.name} checklist must expose ${name}`);
      assert.equal(checklistFields.get(name).type, 'boolean');
      assert.equal(checklistFields.get(name).default, false);
    }
  }
});

test('editor checklist remains advisory and cannot publish content', () => {
  const group = cms.content.find((entry) => entry.name === 'seo-newsroom-review');
  for (const collection of group.items) {
    assert.deepEqual(collection.operations, { create: false, rename: false, delete: false });
    const workflow = collection.fields.find((field) => field.name === 'workflowStatus');
    assert.equal(workflow.readonly, true);
    assert.match(collection.fields.find((field) => field.name === 'newsroomChecklist').description, /does not publish|publish হয় না|publish नहीं करती/i);
  }
});
