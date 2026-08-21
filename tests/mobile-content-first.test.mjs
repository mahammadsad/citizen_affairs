import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const mobileCss = await readFile('src/styles/content-first-mobile.css', 'utf8');
const categoryPortal = await readFile('src/components/CategoryPortal.astro', 'utf8');
const articleCard = await readFile('src/components/ArticleCard.astro', 'utf8');

test('main layout loads the mobile content-first stylesheet after portal styles', () => {
  const portalImport = mainLayout.indexOf("import '../styles/portal-renovation.css'");
  const contentFirstImport = mainLayout.indexOf("import '../styles/content-first-mobile.css'");

  assert.ok(portalImport >= 0);
  assert.ok(contentFirstImport > portalImport);
});

test('category pages own a compact editorial mobile layout without dashboard clutter', () => {
  assert.doesNotMatch(categoryPortal, /category-trust/);
  assert.doesNotMatch(categoryPortal, /category-summary/);
  assert.match(categoryPortal, /@media \(max-width: 680px\)/);
  assert.match(categoryPortal, /\.category-filters \{[\s\S]*overflow-x: auto/);
  assert.match(categoryPortal, /\.category-results \{ grid-template-columns: 1fr/);
});

test('latest-update hero and cards use a compact mobile reading rhythm', () => {
  assert.match(mobileCss, /\.listing-hero\s*\{[\s\S]*?padding:\s*\.9rem 0 \.8rem/);
  assert.match(mobileCss, /\.filter-panel\s*\{[\s\S]*?padding:\s*\.35rem \.65rem/);
  assert.match(mobileCss, /\.utility-description\s*\{[\s\S]*?display:\s*none/);
  assert.match(mobileCss, /\.utility-facts\s*\{[\s\S]*?repeat\(2/);
  assert.doesNotMatch(articleCard, /utility-official/);
  assert.doesNotMatch(articleCard, /utility-verification/);
});
