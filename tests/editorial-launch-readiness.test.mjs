import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const cms = await readFile('.pages.yml', 'utf8');
const packageSource = await readFile('package.json', 'utf8');
const deployWorkflow = await readFile('.github/workflows/deploy.yml', 'utf8');
const readinessAudit = await readFile('scripts/audit-editorial-readiness.mjs', 'utf8');
const adminPage = await readFile('public/admin/index.html', 'utf8');
const runbook = await readFile('docs/EDITORIAL-LAUNCH.md', 'utf8');
const bengaliDirectory = 'src/content/articles/bn';
const starterFiles = [
  'verify-government-job-notice-officially.md',
  'check-exam-admit-card-result-officially.md',
  'use-digilocker-education-documents-safely.md',
  'find-government-schemes-with-myscheme.md',
  'update-aadhaar-and-check-status-officially.md',
  'report-fake-government-message-and-website.md',
  'find-official-government-websites-and-services.md',
];
const publishedStarters = new Set(starterFiles);

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  assert.ok(match, 'article should have YAML frontmatter');
  return parse(match[1]);
}

test('Pages CMS keeps protected draft intake separate from view-only live articles', () => {
  const config = parse(cms);
  const draftGroup = config.content.find((entry) => entry.name === 'draft-articles');
  const liveGroup = config.content.find((entry) => entry.name === 'live-articles');

  assert.ok(draftGroup, 'Pages CMS should expose an explicit private-draft group');
  assert.ok(liveGroup, 'Pages CMS should expose an explicit published/live group');
  assert.equal(draftGroup.items.length, 3);
  assert.equal(liveGroup.items.length, 3);

  const expectedDrafts = {
    'english-drafts': 'src/content/articles/en/drafts',
    'bengali-drafts': 'src/content/articles/bn/drafts',
    'hindi-drafts': 'src/content/articles/hi/drafts',
  };
  for (const collection of draftGroup.items) {
    assert.equal(collection.path, expectedDrafts[collection.name]);
    const contentType = collection.fields.find((field) => field.name === 'contentType');
    const workflow = collection.fields.find((field) => field.name === 'workflowStatus');
    const draft = collection.fields.find((field) => field.name === 'draft');
    const sourceUrls = collection.fields.find((field) => field.name === 'sourceUrls');
    assert.deepEqual(
      { default: contentType.default, hidden: contentType.hidden, required: contentType.required },
      { default: 'explainer', hidden: true, required: true },
    );
    assert.deepEqual(
      { default: workflow.default, hidden: workflow.hidden, required: workflow.required },
      { default: 'draft', hidden: true, required: true },
    );
    assert.deepEqual(
      { default: draft.default, hidden: draft.hidden, required: draft.required },
      { default: true, hidden: true, required: true },
    );
    assert.ok(collection.fields.some((field) => field.name === 'nextReviewDate'));
    assert.ok(collection.fields.find((field) => field.name === 'verificationStatus').options.values.some((option) => option.value === 'partially-confirmed'));
    assert.equal(sourceUrls.required, true);
    assert.deepEqual(sourceUrls.list, { min: 1 });
  }

  for (const collection of liveGroup.items) {
    assert.equal(collection.subfolders, false, 'live collections must not include nested private drafts');
    assert.deepEqual(collection.operations, { create: false, rename: false, delete: false });
    assert.ok(collection.fields.every((field) => field.readonly === true), 'live CMS fields must remain view-only');
  }

  assert.equal(config.settings.content.merge, true);
});

test('draft editor exposes every active citizen portal section', () => {
  for (const category of ['jobs', 'exams', 'materials', 'projects', 'affairs', 'notices', 'guides']) {
    assert.match(cms, new RegExp(`value: ${category}`), `${category} should be available in Pages CMS`);
  }
});

test('editorial readiness audit is part of CI and retains evidence', () => {
  const scripts = JSON.parse(packageSource).scripts;
  assert.equal(scripts['audit:editorial'], 'node scripts/audit-editorial-readiness.mjs');
  assert.match(scripts.validate, /npm run audit:editorial/);
  assert.match(readinessAudit, /editorial-readiness-report\.json/);
  assert.match(readinessAudit, /editorial-readiness-summary\.md/);
  assert.match(readinessAudit, /publicArticlesPerCategory: 2/);
  assert.match(deployWorkflow, /name: Editorial launch readiness audit/);
  assert.match(deployWorkflow, /run: npm run audit:editorial/);
  assert.match(deployWorkflow, /name: Upload editorial launch readiness report/);
  assert.match(deployWorkflow, /retention-days: 30/);
});

test('owner workspace cannot be mistaken for a direct publisher', () => {
  assert.match(adminPage, /noindex, nofollow/);
  assert.match(adminPage, /Draft articles — NOT LIVE/i);
  assert.match(adminPage, /Live articles — PUBLISHED/i);
  assert.match(adminPage, /Protected publication remains separate/i);
  assert.match(adminPage, /requires the existing[\s\S]*approval and publication workflow/i);
  assert.match(runbook, /Do not publish directly from Pages CMS/);
  assert.match(runbook, /Never treat a merged pull request as automatically live/);
});

test('starter queue permits all seven reviewed public Bengali guides', async () => {
  const files = await readdir(bengaliDirectory);
  const found = starterFiles.filter((file) => files.includes(file));
  assert.deepEqual(found.sort(), [...starterFiles].sort());

  const categories = new Set();
  const allowedSourceHosts = new Set([
    'ssc.gov.in',
    'www.india.gov.in',
    'igod.gov.in',
    'www.pib.gov.in',
    'factcheck.pib.gov.in',
    'cybercrime.gov.in',
    'www.cybercrime.gov.in',
    'www.dot.gov.in',
    'nta.ac.in',
    'www.nta.ac.in',
    'www.digilocker.gov.in',
    'verify.digilocker.gov.in',
    'nad.digilocker.gov.in',
    'www.uidai.gov.in',
    'uidai.gov.in',
    'myaadhaar.uidai.gov.in',
    'www.myscheme.gov.in',
  ]);

  let publicCount = 0;

  for (const file of starterFiles) {
    const source = await readFile(`${bengaliDirectory}/${file}`, 'utf8');
    const data = frontmatter(source);
    categories.add(data.category);

    assert.equal(data.language, 'bn');
    assert.equal(data.contentType, 'explainer');
    assert.equal(data.featured, false);
    assert.ok(Array.isArray(data.sourceUrls) && data.sourceUrls.length > 0, `${file} should include official sources`);
    assert.ok(data.lastVerified, `${file} should record source verification`);
    assert.ok(data.nextReviewDate, `${file} should schedule re-verification`);
    assert.ok(new Date(data.nextReviewDate) > new Date(data.lastVerified), `${file} review should follow verification`);
    assert.ok(publishedStarters.has(file));

    publicCount += 1;
    assert.equal(data.workflowStatus, 'published');
    assert.equal(data.verificationStatus, 'partially-confirmed');
    assert.equal(data.draft, false);
    assert.ok(Array.isArray(data.sources) && data.sources.length >= 4);
    assert.ok(data.sources.every((entry) => entry.designation === 'primary'));
    assert.doesNotMatch(source, /সম্পাদকীয় অবস্থা:.*লুকানো খসড়া/);

    if (file === 'find-official-government-websites-and-services.md') {
      assert.ok(data.sourceUrls.includes('https://www.india.gov.in/services'));
      assert.ok(data.sourceUrls.includes('https://igod.gov.in/about_us'));
      assert.ok(data.sourceUrls.every((value) => !value.includes('services.india.gov.in')));
      assert.match(source, /পুরোনো `services\.india\.gov\.in` ঠিকানা এখন/);
    }

    if (file === 'use-digilocker-education-documents-safely.md') {
      assert.ok(data.sourceUrls.includes('https://www.digilocker.gov.in/web/about/faq'));
      assert.ok(data.sourceUrls.includes('https://verify.digilocker.gov.in/'));
      assert.ok(data.sourceUrls.includes('https://nad.digilocker.gov.in/faq'));
      assert.ok(data.sourceUrls.every((value) => !value.includes('/web/case-study')));
      assert.match(source, /Issued Documents এবং uploaded file-এর পার্থক্য/);
      assert.match(source, /প্রতিটি institution একই upload field/);
    }

    if (file === 'find-government-schemes-with-myscheme.md') {
      assert.ok(data.sourceUrls.includes('https://www.myscheme.gov.in/faqs'));
      assert.ok(data.sourceUrls.includes('https://www.myscheme.gov.in/terms-of-use'));
      assert.ok(data.sourceUrls.includes('https://www.myscheme.gov.in/find-scheme/scheme-category'));
      assert.match(source, /চূড়ান্ত eligibility certificate বা benefit approval নয়/);
      assert.match(source, /Application handoff নিরাপদে যাচাই করুন/);
    }

    if (file === 'update-aadhaar-and-check-status-officially.md') {
      assert.ok(data.sourceUrls.includes('https://uidai.gov.in/en/updating-data-on-aadhaar'));
      assert.ok(data.sourceUrls.includes('https://uidai.gov.in/en/1474-english-uk/faqs/your-aadhaar/aadhaar-app/19854-how-to-update-a-mobile-number-through-the-aadhaar-app.html'));
      assert.ok(data.sourceUrls.includes('https://uidai.gov.in/en/1061-english-uk/faqs/aadhaar-online-services/document-update.html'));
      assert.ok(data.sourceUrls.includes('https://myaadhaar.uidai.gov.in/'));
      assert.match(source, /Mobile number update-এর বর্তমান নিয়ম/);
      assert.match(source, /প্রথমবার mobile number register/);
      assert.match(source, /14 June 2027 পর্যন্ত fee ছাড়া/);
      assert.match(source, /request accepted বা rejected/);
    }

    if (file === 'report-fake-government-message-and-website.md') {
      assert.ok(data.sourceUrls.includes('https://www.pib.gov.in/FAQ_fact.aspx?lang=1&reg=3'));
      assert.ok(data.sourceUrls.includes('https://factcheck.pib.gov.in/'));
      assert.ok(data.sourceUrls.includes('https://cybercrime.gov.in/Webform/cyber_suspect.aspx'));
      assert.ok(data.sourceUrls.includes('https://cybercrime.gov.in/Webform/suspect_search_websites.aspx'));
      assert.ok(data.sourceUrls.some((value) => value.startsWith('https://www.dot.gov.in/offerings/schemes-and-services/details/sanchar-saathi')));
      assert.match(source, /Government of India claim হলে PIB Fact Check/);
      assert.match(source, /Report Suspect facility/);
      assert.match(source, /1930-এ অবিলম্বে call/);
      assert.match(source, /Call, SMS বা WhatsApp হলে Chakshu/);
      assert.match(source, /safe certificate নয়/);
    }

    for (const value of data.sourceUrls) {
      const url = new URL(value);
      assert.equal(url.protocol, 'https:');
      assert.ok(allowedSourceHosts.has(url.hostname), `${file} uses an unexpected source host: ${url.hostname}`);
    }
  }

  assert.equal(publicCount, 7);
  assert.deepEqual(
    [...categories].sort(),
    ['affairs', 'exams', 'guides', 'jobs', 'materials', 'notices', 'projects'],
  );
});
