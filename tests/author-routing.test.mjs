import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/ArticleLayout.astro', 'utf8');
const authorPage = await readFile('src/pages/authors/[slug].astro', 'utf8');
const founderRedirect = await readFile('src/pages/authors/mahammad-sad.astro', 'utf8');
const localizedFounderRedirect = await readFile(
  'src/pages/[lang]/authors/mahammad-sad.astro',
  'utf8'
);
const teamPage = await readFile('src/components/TeamPage.astro', 'utf8');
const trustPage = await readFile('src/components/TrustPage.astro', 'utf8');

test('human article bylines remain optional and route to the attributed public profile', () => {
  assert.match(layout, /const\s+normalizedAuthor\s*=\s*author\.trim\(\)/);
  assert.match(layout, /normalizedAuthor\s*!==\s*['"]mahammad-sad['"]/);
  assert.match(layout, /authorProfilePath\(locale,\s*normalizedAuthor\)/);
  assert.match(layout, /showHumanCredits\s*&&\s*authorName/);
  assert.doesNotMatch(layout, /trustPagePath\(locale,\s*'author'\)/);
  assert.match(authorPage, /params: \{ slug: author\.id \}/);
});

test('the founder is presented through the public team page instead of an author page', () => {
  assert.match(founderRedirect, /target="\/team\/"/);
  assert.match(localizedFounderRedirect, /target=\{`\/\$\{locale\}\/team\/`\}/);
  assert.match(teamPage, /title: 'Our Team'/);
  assert.match(teamPage, /class="member-grid"/);
  assert.match(teamPage, /members\.map/);
});

test('the About page always labels and routes the founder destination as Team', () => {
  assert.match(trustPage, /const teamLabel = \{ en: 'Our Team', bn: 'আমাদের টিম', hi: 'हमारी टीम' \}\[locale\]/);
  assert.match(trustPage, /const teamHref = locale === 'en' \? localizedTeamPath\.replace\('\/en\/', '\/'\) : localizedTeamPath/);
  assert.match(trustPage, /\{ label: teamLabel, href: teamHref \}/);
  assert.doesNotMatch(trustPage, /label: t\.authorProfile/);
  assert.doesNotMatch(trustPage, /href: trustPagePath\(locale, 'author'\)/);
});
