import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('main layout loads the shared form submission runtime', async () => {
  const layout = await read('src/layouts/MainLayout.astro');
  assert.match(layout, /FormSubmissionRuntime/);
  assert.match(layout, /<FormSubmissionRuntime\s*\/>/);
});

test('success banners require a verified same-tab submission token', async () => {
  const runtime = await read('src/components/FormSubmissionRuntime.astro');

  assert.match(runtime, /returnedToken\s*&&\s*expectedToken/);
  assert.match(runtime, /returnedToken\s*===\s*expectedToken/);
  assert.match(runtime, /banner\.hidden\s*=\s*!verifiedReturn/);
  assert.match(runtime, /sessionStorage\.setItem/);
  assert.match(runtime, /sessionStorage\.removeItem/);
});

test('form redirect tokens replace the legacy persistent sent flag', async () => {
  const runtime = await read('src/components/FormSubmissionRuntime.astro');

  assert.match(runtime, /queryKey:\s*'career_submission'/);
  assert.match(runtime, /queryKey:\s*'contact_submission'/);
  assert.match(runtime, /returnUrl\.searchParams\.set\(configuration\.queryKey, submissionToken\)/);
  assert.match(runtime, /cleanUrl\.searchParams\.delete\(key\)/);
  assert.match(runtime, /\[\.\.\.queryKeys, 'sent'\]/);
});

test('stale back-forward cache pages cannot keep an old success banner visible', async () => {
  const runtime = await read('src/components/FormSubmissionRuntime.astro');

  assert.match(runtime, /window\.addEventListener\('pageshow'/);
  assert.match(runtime, /event\.persisted/);
  assert.match(runtime, /banner\.hidden\s*=\s*true/);
});
