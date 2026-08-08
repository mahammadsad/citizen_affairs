import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/ArticleLayout.astro', 'utf8');
const authorPage = await readFile('src/pages/authors/[slug].astro', 'utf8');
const aliasRedirect = await readFile('src/pages/authors/citizen-affairs-writer.astro', 'utf8');
const localizedAliasRedirect = await readFile('src/pages/bn/authors/citizen-affairs-writer.astro', 'utf8');
const teamPage = await readFile('src/components/TeamPage.astro', 'utf8');
const trustPage = await readFile('src/components/TrustPage.astro', 'utf8');

test('every named article writer is visible and routes to the attributed public profile', () => {
  assert.match(layout, /const\s+normalizedAuthor\s*=\s*author\.trim\(\)/);
  assert.match(layout, /const\s+showHumanCredits\s*=\s*normalizedAuthor\.length\s*>\s*0/);
  assert.match(layout, /authorProfilePath\(locale,\s*normalizedAuthor\)/);
  assert.match(layout, /showHumanCredits\s*&&\s*authorName/);
  assert.doesNotMatch(layout, /trustPagePath\(locale,\s*'author'\)/);
  assert.match(authorPage, /params: \{ slug: author\.id \}/);
});

test('legacy generic writer aliases resolve through the public team page', async () => {
  assert.match(aliasRedirect, /Astro\.redirect\('\/team\/'/);
  assert.match(localizedAliasRedirect, /Astro\.redirect\('\/bn\/team\/'/);
  assert.match(teamPage, /title: 'Our Team'/);
  assert.match(teamPage, /class="member-grid"/);
  assert.match(teamPage, /members\.map/);
  const privateSlug = ['mahammad', 'sad'].join('-');
  await assert.rejects(access(`src/pages/authors/${privateSlug}.astro`));
});

test('the About page always labels and routes the founder destination as Team', () => {
  assert.match(trustPage, /const teamLabel = \{ en: 'Our Team', bn: 'আমাদের টিম', hi: 'हमारी टीम' \}\[locale\]/);
  assert.match(trustPage, /const teamHref = locale === 'en' \? localizedTeamPath\.replace\('\/en\/', '\/'\) : localizedTeamPath/);
  assert.match(trustPage, /\{ label: teamLabel, href: teamHref \}/);
  assert.doesNotMatch(trustPage, /label: t\.authorProfile/);
  assert.doesNotMatch(trustPage, /href: trustPagePath\(locale, 'author'\)/);
});
