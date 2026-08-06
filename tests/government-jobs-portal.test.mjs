import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const portal = await readFile('src/components/GovernmentJobsPortal.astro', 'utf8');
const contentSchema = await readFile('src/content.config.ts', 'utf8');
const jobsCategory = await readFile('src/content/categories/jobs.yaml', 'utf8');

test('jobs schema permits only government and public-sector employer classifications', () => {
  for (const employerType of [
    'central-government',
    'state-government',
    'union-territory-government',
    'constitutional-body',
    'statutory-body',
    'public-sector-undertaking',
    'public-sector-bank',
    'government-university',
    'government-autonomous-body',
    'government-apprenticeship',
  ]) {
    assert.match(contentSchema, new RegExp(`'${employerType}'`));
  }
  assert.doesNotMatch(contentSchema, /'private-company'/);
  assert.doesNotMatch(contentSchema, /'recruitment-agency'/);
});

test('jobs schema supports qualification, sector and recruitment lifecycle discovery', () => {
  assert.match(contentSchema, /qualificationLevel: z\.array/);
  assert.match(contentSchema, /recruitmentSector: z\.enum/);
  assert.match(contentSchema, /recruitmentStage: z\.enum/);
  assert.match(contentSchema, /'application'/);
  assert.match(contentSchema, /'admit-card'/);
  assert.match(contentSchema, /'answer-key'/);
  assert.match(contentSchema, /'result'/);
});

test('government-only information remains available without occupying the task entry area', () => {
  assert.match(portal, /Government and public-sector recruitment only/);
  assert.match(portal, /শুধু সরকারি ও সরকারি-অনুমোদিত প্রতিষ্ঠানের নিয়োগ/);
  assert.match(portal, /केवल सरकारी और सार्वजनिक क्षेत्र की भर्तियाँ/);
  assert.match(portal, /Private listings blocked/);
  assert.match(portal, /class="jobs-trust-note"/);
  assert.match(jobsCategory, /Private jobs are not listed/);
  assert.doesNotMatch(portal, /class="jobs-hero"/);
  assert.doesNotMatch(portal, /class="government-only"/);
});

test('search, filters and recruitment stages appear before page identity and results', () => {
  const controlsIndex = portal.indexOf('class="jobs-controls"');
  const stagesIndex = portal.indexOf('class="jobs-stage-tabs"');
  const resultLineIndex = portal.indexOf('class="jobs-result-line"');
  const emptyIndex = portal.indexOf('class="jobs-empty"');
  const trustIndex = portal.indexOf('class="jobs-trust-note"');

  assert.ok(controlsIndex > -1);
  assert.ok(stagesIndex > controlsIndex);
  assert.ok(resultLineIndex > stagesIndex);
  assert.ok(emptyIndex > resultLineIndex);
  assert.ok(trustIndex > emptyIndex);
  assert.match(portal, /<h1 id="jobs-page-title">\{name\}<\/h1>/);
  assert.doesNotMatch(portal, /class="jobs-listing-head"/);
  assert.doesNotMatch(portal, /deadlineCentre/);
  assert.doesNotMatch(portal, /All citizen sections/);
});

test('government jobs portal provides accessible search, compact filters, sorting and lifecycle tabs', () => {
  assert.match(portal, /data-job-search/);
  assert.match(portal, /data-job-filter="qualification"/);
  assert.match(portal, /data-job-filter="sector"/);
  assert.match(portal, /data-job-filter="level"/);
  assert.match(portal, /data-job-filter="status"/);
  assert.match(portal, /data-job-sort/);
  assert.match(portal, /data-job-stage="application"/);
  assert.match(portal, /data-job-stage="admit-card"/);
  assert.match(portal, /data-job-stage="answer-key"/);
  assert.match(portal, /data-job-stage="result"/);
  assert.match(portal, /aria-live="polite"/);
  assert.match(portal, /card\.hidden = !visible/);
});

test('job cards retain official identity and structured recruitment metadata in compact form', () => {
  assert.match(portal, /job\.recruitingOrganization/);
  assert.match(portal, /job\.notificationNumber/);
  assert.match(portal, /job\.employerType/);
  assert.match(portal, /job\.qualificationLevel/);
  assert.match(portal, /job\.recruitmentSector/);
  assert.match(portal, /job\.applicationDeadline\.getTime/);
  assert.match(portal, /<ArticleCard \{article\} \{locale\} compact \/>/);
});
