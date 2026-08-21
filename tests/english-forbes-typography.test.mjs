import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const typography = await readFile('src/styles/english-forbes-typography.css', 'utf8');
const mainLayout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

test('English editorial typography self-hosts Merriweather', () => {
  assert.equal(packageJson.dependencies['@fontsource/merriweather'], '5.3.0');
  assert.match(typography, /@fontsource\/merriweather\/400\.css/);
  assert.match(typography, /@fontsource\/merriweather\/700\.css/);
  assert.doesNotMatch(typography, /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(https?:/);
});

test('English uses Merriweather for editorial display and reading but retains sans UI', () => {
  assert.match(typography, /--font-english-editorial:\s*"Merriweather", Georgia/);
  assert.match(typography, /--font-display:\s*var\(--font-english-editorial\) !important/);
  assert.match(typography, /--font-reading:\s*var\(--font-english-editorial\) !important/);
  assert.match(typography, /\.article-content[\s\S]*font-family:\s*var\(--font-english-editorial\) !important/);
  assert.match(typography, /\.portal-header[\s\S]*font-family:\s*var\(--font-latin-ui\) !important/);
});

test('English typography layer loads after multilingual typography', () => {
  assert.match(mainLayout, /import '\.\.\/styles\/english-forbes-typography\.css';/);
  assert.ok(
    mainLayout.indexOf("typography.css") < mainLayout.indexOf("english-forbes-typography.css"),
    'English editorial typography should load after the multilingual base layer'
  );
});
