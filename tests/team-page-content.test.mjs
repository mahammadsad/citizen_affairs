import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const teamPage = await readFile('src/components/TeamPage.astro', 'utf8');

test('team page uses organization-level publication attribution', () => {
  assert.match(teamPage, /class="member-grid"/);
  assert.match(teamPage, /members\.map/);
  assert.match(teamPage, /publication desk rather than individual profiles/);
  assert.doesNotMatch(teamPage, /'@type': 'Person'|founder:/);
});

test('internal editorial and future staffing explanations are not shown', () => {
  assert.doesNotMatch(teamPage, /How article bylines work/);
  assert.doesNotMatch(teamPage, /A growing organization/);
  assert.doesNotMatch(teamPage, /নিবন্ধে লেখকের নাম দেখানোর নিয়ম/);
  assert.doesNotMatch(teamPage, /लेखों में नाम दिखाने की नीति/);
  assert.doesNotMatch(teamPage, /class="team-policy"/);
  assert.doesNotMatch(teamPage, /policy-number/);
});
