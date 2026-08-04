import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(path, 'utf8');
const baseLayout = await read('src/layouts/BaseLayout.astro');
const registration = await read('src/components/ServiceWorkerRegistration.astro');
const worker = await read('src/pages/sw.js.ts');
const offlineDocument = await read('src/components/OfflineDocument.astro');
const localizedOffline = await read('src/pages/[lang]/offline.astro');
const performanceCss = await read('src/styles/performance.css');
const manifest = await read('src/pages/site.webmanifest.ts');
const validator = await read('scripts/validate-performance.mjs');
const packageJson = await read('package.json');
const workflow = await read('.github/workflows/deploy.yml');

test('resilience runtime is deferred and reports connection state accessibly', () => {
  assert.match(baseLayout, /import ServiceWorkerRegistration/);
  assert.match(baseLayout, /<ServiceWorkerRegistration \{locale\}/);
  assert.match(registration, /role="status"/);
  assert.match(registration, /aria-live="polite"/);
  assert.match(registration, /requestIdleCallback/);
  assert.match(registration, /addEventListener\('offline'/);
  assert.match(registration, /addEventListener\('online'/);
});

test('service worker is build-versioned and excludes mutable or private paths', () => {
  assert.match(worker, /PUBLIC_BUILD_COMMIT/);
  assert.match(worker, /CACHE_NAME = CACHE_PREFIX \+ BUILD/);
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.match(worker, /\(\?:admin\|staff\|api\)/);
  assert.match(worker, /deployment\\\\\.json/);
  assert.match(worker, /search-index\\\\\.json/);
  assert.match(worker, /Cache-Control': 'no-cache, no-store, must-revalidate'/);
});

test('offline fallbacks are standalone, multilingual and safety-oriented', () => {
  assert.match(localizedOffline, /\['bn', 'hi'\]/);
  assert.match(offlineDocument, /You are offline/);
  assert.match(offlineDocument, /আপনি অফলাইনে আছেন/);
  assert.match(offlineDocument, /आप ऑफलाइन हैं/);
  assert.match(offlineDocument, /Reconnect before relying on a deadline/);
  assert.match(offlineDocument, /<meta name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(offlineDocument, /<link[^>]+stylesheet/);
});

test('font loading is limited to the language that needs the bundled Bengali font', () => {
  assert.match(baseLayout, /import '\.\.\/styles\/performance\.css'/);
  assert.match(performanceCss, /html\[lang="bn"\]/);
  assert.match(performanceCss, /"Hind Siliguri"/);
  assert.match(performanceCss, /html\[lang="hi"\]/);
  assert.match(performanceCss, /system-ui/);
  assert.match(performanceCss, /backdrop-filter: none/);
});

test('install metadata exposes stable identity, maskable icons and task shortcuts', () => {
  assert.match(manifest, /id: SITE\.basePath/);
  assert.match(manifest, /display_override/);
  assert.match(manifest, /purpose: 'any maskable'/);
  assert.match(manifest, /shortcuts/);
  assert.match(manifest, /search\//);
  assert.match(manifest, /deadlines\//);
});

test('CI enforces and retains generated performance and resilience budgets', () => {
  assert.match(validator, /javascriptTotal/);
  assert.match(validator, /serviceWorker/);
  assert.match(validator, /requiredOfflineFiles/);
  assert.match(validator, /article-hero-image/);
  assert.match(validator, /performance-resilience-report\.json/);
  assert.match(packageJson, /"validate:performance": "node scripts\/validate-performance\.mjs"/);
  assert.match(workflow, /Performance and offline resilience validation/);
  assert.match(workflow, /performance-resilience-\$\{\{ github\.run_id \}\}/);
});
