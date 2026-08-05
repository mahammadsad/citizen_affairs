import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const rootRoute = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const sitemap = await readFile('src/pages/sitemap.xml.ts', 'utf8');
const feed = await readFile('src/lib/feed.ts', 'utf8');

test('English articles are generated at the language-neutral canonical route', () => {
  assert.match(rootRoute, /data\.language === 'en'/);
  assert.match(rootRoute, /params: \{ slug: article\.data\.urlSlug \}/);
  assert.match(rootRoute, /locale === 'en'[\s\S]*\$\{SITE\.url\}\/articles\/\$\{slug\}\//);
  assert.match(rootRoute, /const canonical = article\.data\.canonical \|\| articleUrl\(locale, article\.data\.urlSlug\)/);
});

test('Localized dynamic routes only generate Bengali and Hindi article pages', () => {
  assert.match(localizedRoute, /data\.language !== 'en'/);
  assert.match(localizedRoute, /params: \{ lang: article\.data\.language, slug: article\.data\.urlSlug \}/);
});

test('Every article edition points English alternates to the root article route', () => {
  for (const route of [rootRoute, localizedRoute]) {
    assert.match(route, /\.map\(\(\[lang, entry\]\) => \[lang, articleUrl\(lang, entry!\.data\.urlSlug\)\]\)/);
  }
});

test('The sitemap publishes the same canonical root route for English articles', () => {
  assert.match(
    sitemap,
    /localizedUrl\(\s*article\.data\.language,\s*`articles\/\$\{article\.data\.urlSlug\}`,\s*true\s*\)/
  );
  assert.doesNotMatch(
    sitemap,
    /`\$\{SITE\.url\}\/\$\{article\.data\.language\}\/articles\/\$\{article\.data\.urlSlug\}\//
  );
});

test('RSS uses canonical root links for English articles and localized links otherwise', () => {
  assert.match(
    feed,
    /locale === 'en'[\s\S]*`\$\{SITE\.url\}\/articles\/\$\{slug\}\//
  );
  assert.match(
    feed,
    /`\$\{SITE\.url\}\/\$\{locale\}\/articles\/\$\{slug\}\//
  );
  assert.match(
    feed,
    /link: articleUrl\(article\.data\.language, article\.data\.urlSlug\)/
  );
  assert.doesNotMatch(
    feed,
    /link: `\$\{SITE\.url\}\/\$\{article\.data\.language\}\/articles\//
  );
});
