import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const typography = await readFile('src/styles/typography.css', 'utf8');
const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');

test('portal loads the multilingual typography layer after layout overrides', () => {
  assert.match(mainLayout, /import '\.\.\/styles\/typography\.css';/);
  assert.ok(
    mainLayout.indexOf("content-first-mobile.css") < mainLayout.indexOf("typography.css"),
    'typography should load after mobile layout overrides'
  );
});

test('each language has its own script-appropriate font stack', () => {
  assert.match(typography, /html\[lang="en"\][\s\S]*--font-body: var\(--font-latin-ui\)/);
  assert.match(typography, /html\[lang="bn"\][\s\S]*--font-body: var\(--font-bengali-ui\)/);
  assert.match(typography, /html\[lang="hi"\][\s\S]*--font-body: var\(--font-devanagari-ui\)/);
  assert.match(
    typography,
    /"Noto Sans Bengali Variable", "Noto Sans Bengali", "Hind Siliguri"/
  );
  assert.match(typography, /"Noto Sans Devanagari", "Nirmala UI", Mangal/);
});

test('article typography limits line length and preserves Indic vertical rhythm', () => {
  assert.match(typography, /--reading-measure: 68ch/);
  assert.match(typography, /html\[lang="bn"\][\s\S]*--reading-measure: 43rem/);
  assert.match(typography, /html\[lang="hi"\][\s\S]*--reading-measure: 43rem/);
  assert.match(typography, /html\[lang="bn"\] \.article-content[\s\S]*line-height: 1\.84/);
  assert.match(typography, /html\[lang="hi"\] \.article-content[\s\S]*line-height: 1\.82/);
  assert.match(typography, /text-wrap: balance/);
  assert.match(typography, /text-wrap: pretty/);
});

test('typography remains self-hosted and does not add a remote font dependency', () => {
  assert.doesNotMatch(typography, /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(https?:/);
});
