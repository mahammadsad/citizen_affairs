import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migration = await readFile('supabase/migrations/20260717143337_editorial_foundation.sql', 'utf8');
const contentSchema = await readFile('src/content.config.ts', 'utf8');
const publishFunction = await readFile('supabase/functions/publish-content/index.ts', 'utf8');
const callbackFunction = await readFile('supabase/functions/deployment-callback/index.ts', 'utf8');

test('every editorial table enables row level security', () => {
  const tables = [...migration.matchAll(/create table public\.([a-z_]+)/gi)].map((match) => match[1]);
  assert.ok(tables.length >= 15, 'expected the complete editorial schema');
  for (const table of tables) assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`, 'i'), `${table} is missing RLS`);
});

test('anonymous callers receive no editorial table grant', () => {
  assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete|all)[^;]*\s+to\s+anon\b/i);
  assert.match(migration, /revoke all on schema private from public, anon, authenticated/i);
});

test('independence and publication gates are database enforced', () => {
  assert.match(migration, /Authors cannot approve or fact-check their own work/);
  assert.match(migration, /Required % approval is missing/);
  assert.match(migration, /Publication requires a primary source/);
  assert.match(migration, /publication_request_guard/);
  assert.match(migration, /audit_log_immutable/);
});

test('public snapshots have separate Job and Scheme contracts', () => {
  assert.match(contentSchema, /const jobDetails = z\.object/);
  assert.match(contentSchema, /const schemeDetails = z\.object/);
  assert.match(contentSchema, /contentType: z\.enum\(\['job', 'scheme', 'explainer'\]\)/);
});

test('publishing uses user auth and secret-only deployment feedback', () => {
  assert.match(publishFunction, /auth: "user"/);
  assert.match(publishFunction, /publication_events/);
  assert.match(publishFunction, /GITHUB_DISPATCH_TOKEN/);
  assert.match(callbackFunction, /auth: "secret"/);
  assert.match(callbackFunction, /workflow_status: "published"/);
});
