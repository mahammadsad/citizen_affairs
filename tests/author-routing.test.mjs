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

test('human article bylines remain optional and route to the attributed public profile', () => {
  assert.match(layout, /const normalizedAuthor=author\.trim\(\)/);
  assert.match(layout, /normalizedAuthor!==['"]mahammad-sad['"]/);
  assert.match(layout, /authorProfilePath\(locale,normalizedAuthor\)/);
  assert.match(layout, /showHumanCredits&&authorName/);
  assert.doesNotMatch(layout, /trustPagePath\(locale,'author'\)/);
  assert.match(authorPage, /params: \{ slug: author\.id \}/);
});

test('the founder is presented through the public team page instead of an author page', () => {
  assert.match(founderRedirect, /target="\/team\/"/);
  assert.match(localizedFounderRedirect, /target=\{`\/\$\{locale\}\/team\/`\}/);
  assert.match(teamPage, /title: 'Our Team'/);
  assert.match(teamPage, /AI-assisted articles do not carry a personal author name/);
});
