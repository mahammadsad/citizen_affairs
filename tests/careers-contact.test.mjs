import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getOpenCareerRequisitions, validateCareerRequisition } from '../scripts/lib/career-requisitions.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('careers page makes no unsupported vacancy or application claim', async () => {
  const careers = await read('src/components/CareersPage.astro');
  const copy = await read('src/i18n/careers/en.ts');
  assert.match(copy, /No public vacancies are currently listed/);
  assert.match(careers, /data-public-vacancy-count/);
  assert.match(careers, /getOpenCareerRequisitions/);
  assert.doesNotMatch(careers + copy, /Applications open|Apply now|data-career-form/i);
  assert.doesNotMatch(careers, /<form\b|type="file"|résumé.*delivered/i);
  assert.equal(getOpenCareerRequisitions().length, 0);
});

test('an open careers requisition fails closed without approved hiring and privacy facts', () => {
  const errors = validateCareerRequisition({ status: 'open', id: 'example-role' });
  for (const field of ['legalHiringEntity', 'hiringOwner', 'engagementType', 'location', 'workload', 'compensation', 'openingDate', 'closingDate', 'selectionStages', 'applicantPrivacyNotice']) {
    assert.ok(errors.some((error) => error.includes(field)), `${field} must be required`);
  }
  assert.ok(errors.some((error) => error.includes('approved must be true')));
});

test('contact page fails closed without exposing personal contact details or collecting data', async () => {
  const contact = await read('src/components/ContactPage.astro');
  const contactCopy = await read('src/i18n/contact.ts');
  assert.match(contactCopy, /Direct contact temporarily unavailable/);
  assert.doesNotMatch(contact, /mailto:|data-copy-email/);
  assert.doesNotMatch(contact, /<form\b|formsubmit\.co|sent=1|type="file"|URLSearchParams/);
  assert.match(contactCopy, /Do not send sensitive information or attachments/);
});

test('career and contact routes remain available in English, Bengali and Hindi', async () => {
  const rootCareers = await read('src/pages/careers.astro');
  const localCareers = await read('src/pages/[lang]/careers.astro');
  const rootContact = await read('src/pages/contact.astro');
  const localContact = await read('src/pages/[lang]/contact.astro');
  const sitemap = await read('src/pages/sitemap.xml.ts');
  assert.match(rootCareers, /CareersPage locale="en"/);
  assert.match(localCareers, /\['bn', 'hi'\]/);
  assert.match(rootContact, /ContactPage locale="en"/);
  assert.match(localContact, /\['bn', 'hi'\]/);
  assert.match(sitemap, /localeCluster\('careers', true\)/);
});
