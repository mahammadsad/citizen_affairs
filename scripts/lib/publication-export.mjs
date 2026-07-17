import path from 'node:path';

const toDate = (value, label) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is not a valid date`);
  return date;
};

export function normalizePublicationDates(article, event) {
  const published = toDate(article.publication_date || event.requested_at, 'Publication date');
  const proposedUpdated = article.updated_date ? toDate(article.updated_date, 'Updated date') : published;
  const updated = proposedUpdated < published ? published : proposedUpdated;
  return { published: published.toISOString(), updated: updated.toISOString() };
}

export function normalizePublishedBody(value, title) {
  let body = String(value || '').replace(/\r\n?/g, '\n').trim();
  if (!body.includes('\n') && body.includes('\\n')) body = body.replace(/\\n/g, '\n');

  const escapedTitle = String(title || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (escapedTitle) body = body.replace(new RegExp(`^#\\s+${escapedTitle}\\s*(?:\\n+|$)`, 'i'), '');

  // ArticleLayout owns the page H1. Any remaining body-level H1 is demoted so
  // generated pages retain one accessible primary heading.
  body = body.replace(/^#\s+/gm, '## ').trim();
  return `${body}\n`;
}

export function publicAuthorDocument(profile) {
  if (!profile?.slug || !profile?.is_published) throw new Error('Every attributed staff member needs a published public profile');
  const displayName = profile.display_name || profile.slug.split('-').filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
  if (!displayName) throw new Error(`Public staff profile ${profile.slug} needs a display name`);

  const document = {
    name: displayName,
    bio: profile.biography || undefined,
    publicRole: profile.public_role || undefined,
    areasOfExpertise: profile.areas_of_expertise || [],
    languages: profile.languages || [],
    verificationMethodology: profile.verification_methodology || undefined,
  };

  if (profile.profile_image_path?.startsWith('/uploads/') || profile.profile_image_path?.startsWith('/assets/')) {
    document.image = profile.profile_image_path;
  }
  return Object.fromEntries(Object.entries(document).filter(([, item]) => item !== undefined && item !== ''));
}

export function publicAuthorPath(root, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Invalid public author slug');
  return path.join(root, 'src', 'content', 'authors', `${slug}.json`);
}
