import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const jobsRoute = await readFile('src/pages/[lang]/categories/[category].astro', 'utf8');
const regionFilter = await readFile('src/components/GovernmentJobsRegionFilter.astro', 'utf8');

test('jobs route loads the dependent State and Union Territory filter enhancer', () => {
  assert.match(jobsRoute, /GovernmentJobsRegionFilter/);
  assert.match(jobsRoute, /<GovernmentJobsRegionFilter \{locale\} \{articles\} \/>/);
});

test('State and UT selector remains hidden until State regional level is selected', () => {
  assert.match(regionFilter, /field\.dataset\.jobRegionField/);
  assert.match(regionFilter, /field\.hidden = true/);
  assert.match(regionFilter, /select\.disabled = true/);
  assert.match(regionFilter, /levelSelect\.value === 'state'/);
  assert.match(regionFilter, /field\.hidden = !stateSelected/);
  assert.match(regionFilter, /select\.disabled = !stateSelected/);
  assert.match(regionFilter, /if \(!stateSelected\) select\.value = 'all'/);
});

test('dependent selector includes every state and Union Territory from shared region data', () => {
  assert.match(regionFilter, /import \{ REGIONS, normalizeRegionLabel \}/);
  assert.match(regionFilter, /REGIONS\.slice\(0, 28\)/);
  assert.match(regionFilter, /REGIONS\.slice\(28\)/);
  assert.match(regionFilter, /appendGroup\(labels\.states, states\)/);
  assert.match(regionFilter, /appendGroup\(labels\.uts, unionTerritories\)/);
});

test('job cards are mapped to structured state data and job locations', () => {
  assert.match(regionFilter, /article\.data\.state/);
  assert.match(regionFilter, /article\.data\.job!\.jobLocation/);
  assert.match(regionFilter, /card\.dataset\.region/);
  assert.match(regionFilter, /regions\.includes\(selected\)/);
});

test('dependent selector integrates with existing filters, result count and reset actions', () => {
  assert.match(regionFilter, /levelSelect\.dispatchEvent/);
  assert.match(regionFilter, /data-job-result-count/);
  assert.match(regionFilter, /data-job-no-match/);
  assert.match(regionFilter, /data-active-filter-count/);
  assert.match(regionFilter, /queueMicrotask\(applyRegionFilter\)/);
  assert.match(regionFilter, /select\.value = 'all'/);
});

test('dynamic State and UT control receives the same branded form classes as the portal filters', () => {
  assert.match(regionFilter, /field\.className = 'jobs-region-field'/);
  assert.match(regionFilter, /select\.className = 'jobs-region-select'/);
  assert.match(regionFilter, /<style is:global>/);
  assert.match(regionFilter, /var\(--color-primary\)/);
  assert.match(regionFilter, /var\(--color-green\)/);
  assert.match(regionFilter, /var\(--color-orange\)/);
  assert.match(regionFilter, /var\(--color-surface\)/);
  assert.match(regionFilter, /var\(--color-border\)/);
  assert.match(regionFilter, /var\(--shadow-lg\)/);
});

test('mobile filter sheet stays above the persistent bottom navigation and within the dynamic viewport', () => {
  assert.match(
    regionFilter,
    /bottom: calc\(60px \+ env\(safe-area-inset-bottom\) \+ 0\.75rem\) !important/
  );
  assert.match(regionFilter, /max-height: calc\(100dvh - 60px - env\(safe-area-inset-bottom\) - 1\.5rem\)/);
  assert.match(regionFilter, /z-index: 120 !important/);
  assert.match(regionFilter, /overscroll-behavior: contain/);
  assert.match(regionFilter, /scrollbar-gutter: stable/);
});
