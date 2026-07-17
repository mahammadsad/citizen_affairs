import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePublicationDates, normalizePublishedBody, publicAuthorDocument } from '../scripts/lib/publication-export.mjs';

test('first publication never exports an updated date before its publication date', () => {
  const dates = normalizePublicationDates(
    { publication_date: null, updated_date: '2026-07-17T17:35:26.240286Z' },
    { requested_at: '2026-07-17T17:46:18.685705Z' },
  );
  assert.equal(dates.published, '2026-07-17T17:46:18.685Z');
  assert.equal(dates.updated, dates.published);
});

test('exported article bodies cannot create a second page h1', () => {
  const body = normalizePublishedBody(
    '# Citizen Affairs Publication System Test\n\nIntro.\n\n# Additional heading\n\nDetails.',
    'Citizen Affairs Publication System Test',
  );
  assert.equal(body, 'Intro.\n\n## Additional heading\n\nDetails.\n');
  assert.doesNotMatch(body, /^#\s+/m);
});

test('public author export contains only approved public profile fields', () => {
  const author = publicAuthorDocument({
    slug: 'citizen-affairs-writer',
    display_name: 'Citizen Affairs Writer',
    is_published: true,
    biography: 'Editorial contributor for Citizen Affairs.',
    public_role: 'Staff Writer',
    areas_of_expertise: ['public information'],
    languages: ['en', 'bn'],
    verification_methodology: 'Uses primary and official sources wherever available.',
    profile_image_path: 'editorial-assets/private/avatar.png',
    email: 'must-not-be-exported@example.invalid',
  });
  assert.deepEqual(author, {
    name: 'Citizen Affairs Writer',
    bio: 'Editorial contributor for Citizen Affairs.',
    publicRole: 'Staff Writer',
    areasOfExpertise: ['public information'],
    languages: ['en', 'bn'],
    verificationMethodology: 'Uses primary and official sources wherever available.',
  });
});
