import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8');
const header = await readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8');

test('article hero preserves the source aspect ratio at every viewport', () => {
  assert.match(layout, /\.article-hero-picture\{[^}]*width:100%/);
  assert.match(layout, /\.article-hero-image\{[^}]*width:100%[^}]*height:auto[^}]*object-fit:contain/);
  assert.doesNotMatch(layout, /\.article-hero-image\{[^}]*object-fit:cover/);
  assert.doesNotMatch(layout, /\.article-hero-image\{[^}]*aspect-ratio:/);
});

test('header uses one responsive logo and keeps the language control available on mobile', () => {
  assert.equal((header.match(/<BrandLogo variant="horizontal"[^>]*class="header-brand-logo"/g) || []).length, 1);
  assert.doesNotMatch(header, /class="brand-logo brand-logo-mobile"/);
  assert.doesNotMatch(header, /max-width:420px[^}]*language-picker[^}]*display:none/);
  assert.match(header, /:global\(\.header-brand-logo\)/);
  assert.match(header, /:global\(\.drawer-brand-logo\)/);
});
