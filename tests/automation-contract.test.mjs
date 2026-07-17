import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migration = await readFile('supabase/migrations/20260717191858_ai_workflow_foundation.sql', 'utf8');
const api = await readFile('automation/app/main.py', 'utf8');
const schemas = await readFile('automation/app/schemas.py', 'utf8');

test('every private automation table enables RLS and grants nothing to anon', () => {
  const tables = [...migration.matchAll(/create table public\.([a-z_]+)/gi)].map((match) => match[1]);
  assert.equal(tables.length, 12);
  for (const table of tables) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`, 'i'), `${table} is missing RLS`);
  }
  assert.match(migration, /from anon, authenticated/);
  assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete|all)[^;]*\s+to\s+anon\b/i);
});

test('automation roles are least-privilege and approval remains human-only', () => {
  assert.match(migration, /writer'.*automation\.view/s);
  assert.match(migration, /managing-editor'.*automation\.manage/s);
  assert.match(migration, /AI topic approval requires an authenticated human reviewer/);
  assert.match(migration, /Critical unsupported claims block review and approval/);
  assert.doesNotMatch(api, /@app\.(?:post|put|patch)\([^\n]*publish/i);
});

test('structured AI output blocks active HTML and unresolved critical claims', () => {
  assert.match(schemas, /active HTML is not allowed/);
  assert.match(schemas, /approval_blocked/);
  assert.match(schemas, /CheckStatus\.contradicted/);
});
