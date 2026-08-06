import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const rootPolicy = await readFile('src/pages/editorial-policy.astro', 'utf8');
const localizedPolicy = await readFile('src/pages/[lang]/editorial-policy.astro', 'utf8');
const policyPage = await readFile('src/components/EditorialPolicyPage.astro', 'utf8');
const baseLayout = await readFile('src/layouts/BaseLayout.astro', 'utf8');

test('the English policy route renders content without an interstitial', () => {
  assert.match(rootPolicy, /EditorialPolicyPage/);
  assert.doesNotMatch(rootPolicy, /LanguageRedirect/);
});

test('the localized route generates only Bengali and Hindi policy pages', () => {
  assert.match(localizedPolicy, /\['bn', 'hi'\]/);
  assert.doesNotMatch(localizedPolicy, /locales\.map/);
  assert.match(localizedPolicy, /EditorialPolicyPage/);
});

test('policy metadata uses the root English route and localized alternatives', () => {
  assert.match(policyPage, /lang === 'en'/);
  assert.match(policyPage, /\$\{SITE\.url\}\/editorial-policy\//);
  assert.match(baseLayout, /publishingPrinciples: `\$\{SITE\.url\}\/editorial-policy\/`/);
  assert.match(baseLayout, /ethicsPolicy: `\$\{SITE\.url\}\/editorial-policy\/`/);
});
