import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const deadlineRoute = await readFile('src/pages/[lang]/deadlines.astro', 'utf8');
const savedRoute = await readFile('src/pages/[lang]/saved.astro', 'utf8');
const deadlineCenter = await readFile('src/components/DeadlineActionCenter.astro', 'utf8');
const savedCenter = await readFile('src/components/SavedActionCenter.astro', 'utf8');
const searchIndex = await readFile('src/pages/[lang]/search-index.json.ts', 'utf8');

test('localized deadline and saved routes use the action-centre components', () => {
  assert.match(deadlineRoute, /DeadlineActionCenter/);
  assert.match(deadlineRoute, /getUpcomingDeadlines/);
  assert.match(savedRoute, /SavedActionCenter/);
  assert.match(savedRoute, /robots="noindex, follow"/);
  assert.match(savedRoute, /search-index\.json/);
});

test('deadline centre exposes urgency, section and sorting controls accessibly', () => {
  for (const bucket of ['urgent', 'soon', 'later', 'closed']) {
    assert.match(deadlineCenter, new RegExp(`data-deadline-filter="${bucket}"`));
    assert.match(deadlineCenter, new RegExp(`data-deadline-count="${bucket}"`));
  }
  assert.match(deadlineCenter, /id="deadlineCategory"/);
  assert.match(deadlineCenter, /id="deadlineSort"/);
  assert.match(deadlineCenter, /aria-live="polite"/);
  assert.match(deadlineCenter, /aria-pressed/);
  assert.match(deadlineCenter, /bucketFor/);
  assert.match(deadlineCenter, /new Intl\.NumberFormat/);
});

test('saved action centre stays private and supports safe list management', () => {
  assert.match(savedCenter, /localStorage\.getItem/);
  assert.match(savedCenter, /localStorage\.setItem/);
  assert.match(savedCenter, /saved-articles/);
  assert.match(savedCenter, /recently-viewed/);
  assert.match(savedCenter, /data-list-key/);
  assert.match(savedCenter, /role="tablist"/);
  assert.match(savedCenter, /aria-selected/);
  assert.match(savedCenter, /removeItem/);
  assert.match(savedCenter, /clearSavedList/);
  assert.doesNotMatch(savedCenter, /innerHTML\s*=/);
  assert.doesNotMatch(savedCenter, /fetch\(['"]https?:\/\//);
});

test('saved items are enriched with current deadline metadata from the static index', () => {
  assert.match(savedCenter, /data-index-url/);
  assert.match(savedCenter, /indexMap/);
  assert.match(savedCenter, /bucketFor/);
  assert.match(savedCenter, /cache: 'no-store'/);
  assert.match(searchIndex, /deadline:/);
  assert.match(searchIndex, /updated:/);
  assert.match(searchIndex, /category:/);
  assert.match(searchIndex, /verification:/);
});

test('deadline and saved guidance is available in English, Bengali and Hindi', () => {
  for (const source of [deadlineCenter, savedCenter]) {
    assert.match(source, /en:/);
    assert.match(source, /bn:/);
    assert.match(source, /hi:/);
  }
  assert.match(deadlineCenter, /শেষ তারিখের আগেই পরিকল্পনা করুন/);
  assert.match(savedCenter, /केवल इस ब्राउज़र में संग्रहीत/);
});
