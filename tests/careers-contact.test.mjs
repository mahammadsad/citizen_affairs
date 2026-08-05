import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage footer directs visitors to dedicated contact and careers pages without exposing the email card', async () => {
  const footer = await read('src/components/Footer.astro');
  assert.match(footer, /route\('careers'\)/);
  assert.match(footer, /trustPagePath\(locale, 'contact'\)/);
  assert.doesNotMatch(footer, /BRAND\.contactEmail/);
  assert.doesNotMatch(footer, /class="contact-card"/);
});

test('careers page provides detailed jobs, internships and a secure mailbox application form', async () => {
  const careers = await read('src/components/CareersPage.astro');
  const careersIndex = await read('src/i18n/careers.ts');
  const careersEn = await read('src/i18n/careers/en.ts');
  const careersBn = await read('src/i18n/careers/bn.ts');
  const careersHi = await read('src/i18n/careers/hi.ts');

  for (const role of ['Content Writer', 'Digital Marketing', 'Video Editor', 'Fact-checker', 'Social Media', 'Information Designer']) {
    assert.match(careersEn, new RegExp(role, 'i'));
  }

  assert.match(careersIndex, /CAREERS_EN/);
  assert.match(careersIndex, /CAREERS_BN/);
  assert.match(careersIndex, /CAREERS_HI/);
  assert.match(careersEn, /"kind": "job"/);
  assert.match(careersEn, /"kind": "internship"/);
  assert.match(careersEn, /Editorial & Research Internship/);
  assert.match(careersBn, /এডিটোরিয়াল ও রিসার্চ ইন্টার্নশিপ/);
  assert.match(careersHi, /एडिटोरियल और रिसर्च इंटर्नशिप/);

  assert.match(careers, /data-role-filter="job"/);
  assert.match(careers, /data-role-filter="internship"/);
  assert.match(careers, /data-role-details/);
  assert.match(careers, /role\.responsibilities\.map/);
  assert.match(careers, /role\.requirements\.map/);
  assert.match(careers, /role\.idealFor/);
  assert.match(careers, /candidate\.open = false/);

  assert.match(careers, /https:\/\/formsubmit\.co\/\$\{BRAND\.contactEmail\}/);
  assert.match(careers, /enctype="multipart\/form-data"/);
  assert.match(careers, /name="_honey"/);
  assert.match(careers, /data-resume/);
  assert.match(careers, /10 \* 1024 \* 1024/);
  assert.match(careersEn, /Citizen Affairs never charges an application fee/);
});

test('contact page is renovated with direct email, intent routing, safety guidance and mailbox delivery', async () => {
  const contact = await read('src/components/ContactPage.astro');
  const contactCopy = await read('src/i18n/contact.ts');
  assert.match(contactCopy, /Report a factual correction/);
  assert.match(contactCopy, /Partnerships, media or business/);
  assert.match(contact, /data-copy-email/);
  assert.match(contact, /https:\/\/formsubmit\.co\/\$\{BRAND\.contactEmail\}/);
  assert.match(contact, /name="_honey"/);
  assert.match(contactCopy, /Do not include Aadhaar numbers, OTPs, bank passwords/);
  assert.match(contact, /route\(locale, 'careers'\)/);
});

test('career and contact routes are available in English, Bengali and Hindi and careers are discoverable in sitemap', async () => {
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
