import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { parse } from 'yaml';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('production brand and custom domain are canonical', () => {
  const brand = JSON.parse(read('brand.config.json'));
  assert.equal(brand.brandNameEn, 'Citizen Affairs');
  assert.equal(brand.brandShortName, 'Citizen Affairs');
  assert.equal(brand.domain, 'https://citizenaffairs.in');
  assert.equal(read('public/CNAME').trim(), 'citizenaffairs.in');
  assert.equal(Object.keys(brand).some((key) => key.startsWith('transitionNotice')), false);
  assert.doesNotMatch(JSON.stringify(brand), /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র|सरकारी तथ्य केंद्र/i);
});

test('active production integrations use the Citizen Affairs repository', () => {
  const activeFiles = [
    'README.md',
    'astro.config.mjs',
    'src/utils/constants.ts',
    'src/lib/rehype-image-attrs.mjs',
    'src/lib/seo.ts',
    'public/admin/index.html',
    '.pages.yml',
    'supabase/functions/publish-content/index.ts',
    'docs/DEPLOYMENT.md',
    'docs/ENVIRONMENT.md',
    'docs/IMPLEMENTATION-REPORT.md',
    'docs/OWNER-OPERATIONS.md',
    'docs/TROUBLESHOOTING.md',
    ...readdirSync(new URL('../.github/workflows/', import.meta.url)).map((name) => `.github/workflows/${name}`),
  ];
  for (const file of activeFiles) {
    assert.doesNotMatch(read(file), /sarkari-tathya-kendra/i, `${file} contains the obsolete repository slug`);
  }

  const publishFunction = read('supabase/functions/publish-content/index.ts');
  assert.match(publishFunction, /Deno\.env\.get\("GITHUB_REPOSITORY"\) \|\| "citizen_affairs"/);
  assert.match(read('public/admin/index.html'), /mahammadsad\/citizen_affairs/);
});

test('custom-domain and repository Pages paths remain distinct', () => {
  const astro = read('astro.config.mjs');
  const constants = read('src/utils/constants.ts');
  for (const source of [astro, constants]) {
    assert.match(source, /https:\/\/mahammadsad\.github\.io\/citizen_affairs/);
    assert.match(source, /\/citizen_affairs\//);
    assert.match(source, /brand\.domain|BRAND\.domain/);
  }
  assert.match(astro, /brand\.domain \? '\/'/);
  assert.match(constants, /BRAND\.domain \? '\/'/);
});

test('deleted Supabase production integration remains disconnected and fail-closed', () => {
  const deletedProject = 'tbymfgorepzzewagivit';
  const activeFiles = [
    'README.md',
    'src/layouts/BaseLayout.astro',
    'src/pages/staff/index.astro',
    '.github/workflows/deploy.yml',
    '.github/workflows/publish-content.yml',
    '.github/workflows/topic-discovery.yml',
    'docs/ARCHITECTURE.md',
    'docs/BACKUP-RECOVERY.md',
    'docs/DATABASE.md',
    'docs/DEPLOYMENT.md',
    'docs/ENVIRONMENT.md',
    'docs/IMPLEMENTATION-REPORT.md',
    'docs/OWNER-OPERATIONS.md',
    'docs/SECURITY.md',
    'docs/TROUBLESHOOTING.md',
  ];
  for (const file of activeFiles) {
    assert.doesNotMatch(read(file), new RegExp(deletedProject, 'i'), `${file} references the deleted Supabase project`);
  }

  const deploy = read('.github/workflows/deploy.yml');
  assert.match(deploy, /vars\.SUPABASE_INTEGRATION_ENABLED == 'true' && vars\.PUBLIC_SUPABASE_URL/);
  assert.match(deploy, /vars\.SUPABASE_INTEGRATION_ENABLED == 'true' && vars\.PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(deploy, /PUBLIC_SUPABASE_URL:\s*https:\/\//);
  assert.doesNotMatch(deploy, /PUBLIC_SUPABASE_PUBLISHABLE_KEY:\s*sb_/);
  assert.match(read('.github/workflows/publish-content.yml'), /if: vars\.SUPABASE_INTEGRATION_ENABLED == 'true'/);

  const discovery = read('.github/workflows/topic-discovery.yml');
  assert.match(discovery, /if: vars\.SUPABASE_INTEGRATION_ENABLED == 'true' && vars\.AUTOMATION_ENABLED == 'true'/);
  assert.doesNotMatch(discovery, /^\s*schedule:/m);
  assert.match(read('src/pages/staff/index.astro'), /Editorial workspace temporarily unavailable/);
});

test('Pages CMS creates protected organization-attributed drafts and exposes live content read-only', () => {
  const cms = parse(read('.pages.yml'));
  const draftGroup = cms.content.find((entry) => entry.name === 'draft-articles');
  const liveGroup = cms.content.find((entry) => entry.name === 'live-articles');
  assert.ok(draftGroup);
  assert.ok(liveGroup);
  assert.equal(draftGroup.items.length, 3);
  assert.equal(liveGroup.items.length, 3);

  for (const collection of draftGroup.items) {
    const author = collection.fields.find((field) => field.name === 'author');
    const draft = collection.fields.find((field) => field.name === 'draft');
    assert.deepEqual(
      { default: author.default, hidden: author.hidden, required: author.required },
      { default: 'citizen-affairs-editorial-desk', hidden: true, required: true },
    );
    assert.deepEqual(
      { default: draft.default, hidden: draft.hidden, required: draft.required },
      { default: true, hidden: true, required: true },
    );
    assert.match(collection.path, /^src\/content\/articles\/(en|bn|hi)\/drafts$/);
  }

  for (const collection of liveGroup.items) {
    assert.equal(collection.subfolders, false);
    assert.deepEqual(collection.operations, { create: false, rename: false, delete: false });
    assert.ok(collection.fields.every((field) => field.readonly === true));
  }

  assert.equal(cms.settings.content.merge, true, 'Pages CMS must preserve controlled fields outside its draft schema');
  const authors = readdirSync(new URL('../src/content/authors/', import.meta.url));
  assert.deepEqual(authors, ['citizen-affairs-editorial-desk.json']);
  assert.equal(JSON.parse(read('src/content/authors/citizen-affairs-editorial-desk.json')).name, 'Citizen Affairs Editorial Desk');
  assert.equal(JSON.parse(read('brand.config.json')).contactEmail, '');
});

test('public source contains no personal identity, personal contact address or personal author route', () => {
  const privateMarkers = [
    ['Mahammad', 'Sad'].join(' '),
    ['contact', '.', 'mahammadsad', '@gmail.com'].join(''),
    ['mahammad', '-', 'sad'].join(''),
  ];
  const publicFiles = [
    'brand.config.json',
    'src/utils/constants.ts',
    'src/data/team.ts',
    'src/components/ContactPage.astro',
    'src/components/TeamPage.astro',
    'src/components/TransparencyPage.astro',
    'src/components/TrustPage.astro',
    'src/i18n/contact.ts',
    'src/i18n/trust.ts',
    'src/layouts/ArticleLayout.astro',
    'src/layouts/BaseLayout.astro',
    'src/pages/404.astro',
  ];
  for (const file of publicFiles) {
    for (const marker of privateMarkers) {
      assert.doesNotMatch(read(file), new RegExp(marker, 'i'), `${file} exposes a private marker`);
    }
  }
});

test('all workflow actions are pinned to immutable commit SHAs', () => {
  let remoteActionCount = 0;
  for (const name of readdirSync(new URL('../.github/workflows/', import.meta.url))) {
    const workflow = read(`.github/workflows/${name}`);
    for (const match of workflow.matchAll(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm)) {
      const reference = match[1];
      if (reference.startsWith('./') || reference.startsWith('docker://')) continue;
      remoteActionCount += 1;
      assert.match(reference, /^[^@\s]+@[0-9a-f]{40}$/, `${name} has a mutable action reference: ${reference}`);
    }
  }
  assert.ok(remoteActionCount >= 10, 'expected to validate every production workflow action');
});

test('publication merge handling is explicit and terminal', () => {
  const workflow = read('.github/workflows/publish-content.yml');
  assert.doesNotMatch(workflow, /\|\|\s*true/);
  assert.match(workflow, /gh pr create/);
  assert.match(workflow, /number=\$pr_number/);
  assert.match(workflow, /url=\$pr_url/);
  assert.match(workflow, /\.allow_auto_merge/);
  assert.match(workflow, /branches\/main\/protection/);
  assert.match(workflow, /gh pr merge .*--auto --squash/);
  assert.match(workflow, /autoMergeRequest/);
  assert.match(workflow, /gh pr checks .*--required --watch --fail-fast/);
  assert.match(workflow, /\$pr_state.*MERGED/);
  assert.match(workflow, /gh pr close .*--delete-branch/);
  assert.match(workflow, /status:'failed'/);
});

test('scheduled automation uses its package context and pinned workflow', () => {
  const workflow = read('.github/workflows/topic-discovery.yml');
  assert.match(workflow, /working-directory: automation\s+run: python -m pytest -q/);
});

test('generated output is covered by the server-secret scanner', () => {
  const scanner = read('scripts/scan-secrets.mjs');
  assert.match(scanner, /'src', 'public', 'dist'/);
  assert.match(scanner, /sb_secret_/);
  assert.match(scanner, /github_pat_/);
  assert.match(scanner, /PRIVATE KEY/);
});

test('technical test content cannot enter public discovery output', () => {
  for (const file of ['src/pages/sitemap.xml.ts', 'src/pages/rss.xml.ts', 'src/lib/content.ts']) {
    const source = read(file);
    assert.match(source, /workflowStatus|isPublicWorkflow/);
    assert.match(source, /withdrawn|isPublicWorkflow/);
  }
});

test('search is noindex and excluded from sitemap', () => {
  assert.match(read('src/components/SearchPage.astro'), /noindex, follow/);
  assert.doesNotMatch(read('src/pages/sitemap.xml.ts'), /\/search\/?['"`]/);
});

test('staff is noindex nofollow and anon table access is revoked', () => {
  assert.match(read('src/pages/staff/index.astro'), /noindex, nofollow/);
  assert.match(read('supabase/migrations/20260718072400_revoke_anon_table_privileges.sql'), /revoke all privileges on all tables.*from anon/is);
});

test('deployment keeps PRs test-only and requires post-deployment smoke tests', () => {
  const workflow = read('.github/workflows/deploy.yml');
  assert.match(workflow, /if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /production-smoke:/);
  assert.match(workflow, /https:\/\/citizenaffairs\.in/);
  assert.match(workflow, /EXPECTED_BUILD_COMMIT: \$\{\{ github\.sha \}\}/);
});

test('production smoke assertions use exact labels and parse every JSON-LD block', () => {
  const smoke = read('tests/production/production.spec.mjs');
  assert.doesNotMatch(smoke, /locator\('body'\)\)\.not\.toContainText\(inactiveCategories\)/);
  assert.match(smoke, /\^Notices\$/);
  assert.match(smoke, /meta\[name="x-build-commit"\]/);
  assert.doesNotMatch(smoke, /filter\(\{ hasText:/);
  assert.match(smoke, /const extractJsonLd =/);
  assert.match(smoke, /html\.matchAll\(/);
  assert.match(smoke, /extractJsonLd\(await response\.text\(\)\)/);
  assert.match(smoke, /expect\(articleTypes\)\.toHaveLength\(1\)/);
});
