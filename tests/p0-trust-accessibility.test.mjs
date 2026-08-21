import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('shared pages have one main landmark owner and nested components do not add another', async () => {
  const layout = await read('src/layouts/MainLayout.astro');
  assert.equal((layout.match(/<main\b/g) || []).length, 1);
  assert.match(layout, /<main id="main-content" tabindex="-1">/);
  for (const path of [
    'src/components/CitizenPortalHome.astro',
    'src/components/TeamPage.astro',
    'src/components/DeadlineActionCenter.astro',
    'src/components/SavedActionCenter.astro',
    'src/components/GovernmentJobsPortal.astro',
    'src/components/ContactPage.astro',
    'src/components/CareersPage.astro',
  ]) {
    assert.doesNotMatch(await read(path), /<main\b/, `${path} must not nest a main landmark`);
  }

  const notFoundPage = await read('src/pages/404.astro');
  assert.doesNotMatch(notFoundPage, /<main\b/, '404 content must use the shared main landmark');

  for (const path of ['src/pages/staff/index.astro', 'src/pages/status.astro']) {
    const page = await read(path);
    assert.match(page, /<main id="main-content"[^>]*tabindex="-1"/, `${path} must provide the BaseLayout skip target`);
  }
});

test('inactive mobile navigation is removed from the accessibility tree', async () => {
  const header = await read('src/components/PortalHeader.astro');
  assert.match(header, /class="portal-mobile-panel"[^>]*aria-hidden="true"[^>]*inert/);
  assert.doesNotMatch(header, /portal-mobile-bottom/);
});

test('retired branding and unapproved public form processors are prohibited', async () => {
  const brand = await read('brand.config.json');
  const contact = await read('src/components/ContactPage.astro');
  const careers = await read('src/components/CareersPage.astro');
  const combined = brand + contact + careers;
  assert.doesNotMatch(combined, /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র|सरकारी तथ्य केंद्र/i);
  assert.doesNotMatch(combined, /formsubmit\.co|[?&]sent=1/i);
});