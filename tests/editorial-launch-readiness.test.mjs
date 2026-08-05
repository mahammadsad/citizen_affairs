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
const publishedStarters = new Set([
  'find-official-government-websites-and-services.md',
  'use-digilocker-education-documents-safely.md',
  'find-government-schemes-with-myscheme.md',
  'update-aadhaar-and-check-status-officially.md',
]);

function frontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  assert.ok(match, 'article should have YAML frontmatter');
  return parse(match[1]);
}

test('Pages CMS is a protected draft-only intake for all three languages', () => {
  for (const collection of ['english-articles', 'bengali-articles', 'hindi-articles']) {
    assert.match(cms, new RegExp(`name: ${collection}`));
  }

  assert.equal((cms.match(/name: contentType, label: Content type, type: string, default: explainer, hidden: true/g) || []).length, 3);
  assert.equal((cms.match(/name: workflowStatus, label: Workflow status, type: string, default: draft, hidden: true/g) || []).length, 3);
  assert.equal((cms.match(/name: draft, label: Draft, type: boolean, default: true, hidden: true/g) || []).length, 3);
  assert.equal((cms.match(/name: nextReviewDate/g) || []).length, 3);
  assert.equal((cms.match(/value: partially-confirmed/g) || []).length, 3);
  assert.equal((cms.match(/name: sourceUrls[^\n]*list: \{ min: 1 \}[^\n]*required: true/g) || []).length, 3);
  assert.match(cms, /merge: true/);
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
  assert.match(adminPage, /hidden drafts only/i);
  assert.match(adminPage, /cannot publish directly/i);
  assert.match(adminPage, /protected review/i);
  assert.match(runbook, /Do not publish directly from Pages CMS/);
  assert.match(runbook, /Never treat a merged pull request as automatically live/);
});

test('starter queue keeps three drafts protected and permits four reviewed public guides', async () => {
  const files = await readdir(bengaliDirectory);
  const found = starterFiles.filter((file) => files.includes(file));
  assert.deepEqual(found.sort(), [...starterFiles].sort());

  const categories = new Set();
  const allowedSourceHosts = new Set([
    'ssc.gov.in',
    'www.india.gov.in',
    'igod.gov.in',
    'www.pib.gov.in',
    'cybercrime.gov.in',
    'www.nta.ac.in',
    'www.digilocker.gov.in',
    'verify.digilocker.gov.in',
    'nad.digilocker.gov.in',
    'www.uidai.gov.in',
    'uidai.gov.in',
    'myaadhaar.uidai.gov.in',
    'www.myscheme.gov.in',
  ]);

  let draftCount = 0;
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

    if (publishedStarters.has(file)) {
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
    } else {
      draftCount += 1;
      assert.equal(data.workflowStatus, 'draft');
      assert.equal(data.verificationStatus, 'under-verification');
      assert.equal(data.draft, true);
      assert.match(source, /লুকানো খসড়া/);
    }

    for (const value of data.sourceUrls) {
      const url = new URL(value);
      assert.equal(url.protocol, 'https:');
      assert.ok(allowedSourceHosts.has(url.hostname), `${file} uses an unexpected source host: ${url.hostname}`);
    }
  }

  assert.equal(publicCount, 4);
  assert.equal(draftCount, 3);
  assert.deepEqual(
    [...categories].sort(),
    ['affairs', 'exams', 'guides', 'jobs', 'materials', 'notices', 'projects'],
  );
});
