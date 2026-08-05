import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const mobileCss = await readFile('src/styles/content-first-mobile.css', 'utf8');

test('main layout loads the mobile content-first stylesheet after portal styles', () => {
  const portalImport = mainLayout.indexOf("import '../styles/portal-renovation.css'");
  const contentFirstImport = mainLayout.indexOf("import '../styles/content-first-mobile.css'");

  assert.ok(portalImport >= 0);
  assert.ok(contentFirstImport > portalImport);
});

test('mobile category pages remove pre-feed clutter while retaining useful controls', () => {
  assert.match(mobileCss, /@media \(max-width: 680px\)/);
  assert.match(mobileCss, /\.category-trust\s*\{[\s\S]*?display:\s*none\s*!important/);
  assert.match(mobileCss, /\.category-summary\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
  assert.match(mobileCss, /\.category-summary div:nth-child\(n \+ 4\)/);
  assert.match(mobileCss, /\.category-filters\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(mobileCss, /\.category-content\s*\{[\s\S]*?padding-top:\s*\.7rem/);
});

test('latest-update hero and cards use a compact mobile reading rhythm', () => {
  assert.match(mobileCss, /\.listing-hero\s*\{[\s\S]*?padding:\s*\.9rem 0 \.8rem/);
  assert.match(mobileCss, /\.filter-panel\s*\{[\s\S]*?padding:\s*\.35rem \.65rem/);
  assert.match(mobileCss, /\.utility-description\s*\{[\s\S]*?display:\s*none/);
  assert.match(mobileCss, /\.utility-facts\s*\{[\s\S]*?repeat\(2/);
  assert.match(mobileCss, /\.utility-facts div:nth-child\(n \+ 3\)/);
  assert.match(mobileCss, /\.utility-official\s*\{[\s\S]*?display:\s*none/);
});
