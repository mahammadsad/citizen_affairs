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
  assert.match(brand.transitionNoticeEn, /formerly Sarkari Tathya Kendra/);
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

test('Pages CMS creates protected drafts with a real author', () => {
  const cms = parse(read('.pages.yml'));
  const articleGroup = cms.content.find((entry) => entry.name === 'articles');
  assert.ok(articleGroup);
  assert.equal(articleGroup.items.length, 3);
  for (const collection of articleGroup.items) {
    const author = collection.fields.find((field) => field.name === 'author');
    const draft = collection.fields.find((field) => field.name === 'draft');
    assert.deepEqual({ default: author.default, hidden: author.hidden, required: author.required }, { default: 'mahammad-sad', hidden: true, required: true });
    assert.deepEqual({ default: draft.default, hidden: draft.hidden, required: draft.required }, { default: true, hidden: true, required: true });
  }
  assert.equal(cms.settings.content.merge, true, 'Pages CMS must preserve controlled fields outside its draft schema');
  const author = JSON.parse(read('src/content/authors/mahammad-sad.json'));
  assert.equal(author.name, 'Mahammad Sad');
  assert.ok(author.publicRole);
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
  assert.match(smoke, /allTextContents\(\)\)\.map\(\(source\) => JSON\.parse\(source\)\)/);
  assert.match(smoke, /expect\(articleTypes\)\.toHaveLength\(1\)/);
});
