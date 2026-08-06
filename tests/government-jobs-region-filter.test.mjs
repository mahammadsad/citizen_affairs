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

test('filter sheet provides an explicit localized Show results action beside Clear filters', () => {
  assert.match(regionFilter, /applyPattern: 'Show \{count\} updates'/);
  assert.match(regionFilter, /applyPattern: '\{count\}টি আপডেট দেখুন'/);
  assert.match(regionFilter, /applyPattern: '\{count\} अपडेट दिखाएँ'/);
  assert.match(regionFilter, /applyButton\.dataset\.jobApply/);
  assert.match(regionFilter, /actions\.append\(applyButton, appliedStatus\)/);
  assert.match(regionFilter, /resetButton\.classList\.add\('jobs-filter-clear'\)/);
  assert.match(regionFilter, /grid-template-columns: minmax\(0, 0\.86fr\) minmax\(0, 1\.14fr\)/);
  assert.match(regionFilter, /background: var\(--color-primary\) !important/);
});

test('Show results confirms the count, closes the sheet and moves focus to the result summary', () => {
  assert.match(regionFilter, /new MutationObserver\(syncApplyButton\)/);
  assert.match(regionFilter, /labels\.applyPattern\.replace\('\{count\}', String\(count\)\)/);
  assert.match(regionFilter, /labels\.appliedPattern\.replace\('\{count\}', String\(count\)\)/);
  assert.match(regionFilter, /filterDetails\.open = false/);
  assert.match(regionFilter, /resultCount\.focus\(\{ preventScroll: true \}\)/);
  assert.match(regionFilter, /resultCount\.scrollIntoView/);
  assert.match(regionFilter, /aria-controls/);
});

test('mobile actions stay fixed while the filter fields scroll independently', () => {
  assert.match(regionFilter, /filterPanel\.classList\.add\('jobs-filter-panel-enhanced'\)/);
  assert.match(regionFilter, /fields\.className = 'jobs-filter-fields'/);
  assert.match(regionFilter, /overflow: hidden !important/);
  assert.match(regionFilter, /\.jobs-filter-fields \{[\s\S]*overflow-y: auto/);
  assert.match(regionFilter, /\.jobs-filter-actions \{[\s\S]*flex: 0 0 auto/);
});
