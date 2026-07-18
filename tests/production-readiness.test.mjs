import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('production brand and custom domain are canonical', () => {
  const brand = JSON.parse(read('brand.config.json'));
  assert.equal(brand.brandNameEn, 'Citizen Affairs');
  assert.equal(brand.brandShortName, 'Citizen Affairs');
  assert.equal(brand.domain, 'https://citizenaffairs.in');
  assert.equal(read('public/CNAME').trim(), 'citizenaffairs.in');
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
});
