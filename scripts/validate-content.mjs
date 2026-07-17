import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const contentRoot = join(root, 'src/content/articles');
const authorRoot = join(root, 'src/content/authors');
const publicRoot = join(root, 'public');
const brand = JSON.parse(readFileSync(join(root, 'brand.config.json'), 'utf8'));
const activeCategories = new Set(brand.activeCategoryIds);
const errors = [];
const authorExtensions = new Set(['.json', '.yaml', '.yml', '.toml']);
const authorSlugs = new Set(
  readdirSync(authorRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && authorExtensions.has(extname(entry.name)))
    .map((entry) => entry.name.slice(0, -extname(entry.name).length)),
);

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, extension);
    return extname(entry.name) === extension ? [path] : [];
  });
}

function frontmatter(path) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!match) throw new Error('missing YAML frontmatter');
  return parse(match[1]);
}

function required(record, fields, label, file) {
  for (const field of fields) {
    const value = record?.[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${file}: ${label}.${field} is required`);
    }
  }
}

function asTime(value) {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

const articles = [];
for (const path of walk(contentRoot, '.md')) {
  const file = relative(root, path);
  try {
    const data = frontmatter(path);
    articles.push({ file, data });

    required(data, ['language', 'translationKey', 'urlSlug', 'title', 'description', 'date', 'author', 'category'], 'article', file);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.urlSlug || '')) errors.push(`${file}: invalid URL slug`);
    if (!['en', 'bn', 'hi'].includes(data.language)) errors.push(`${file}: unsupported language`);
    if (!data.draft && !activeCategories.has(data.category)) errors.push(`${file}: inactive category must remain draft`);
    if (!data.draft && data.workflowStatus !== 'published') errors.push(`${file}: public content must have workflowStatus: published`);
    for (const field of ['author', 'assignedEditor', 'factCheckedBy', 'copyReviewedBy', 'reviewedBy', 'publishedBy']) {
      if (data[field] && !authorSlugs.has(data[field])) errors.push(`${file}: ${field} profile does not exist: ${data[field]}`);
    }

    const articleSource = readFileSync(path, 'utf8');
    const articleBody = articleSource.replace(/^---\s*\n[\s\S]*?\n---(?:\s*\n|$)/, '');
    if (/^#\s+/m.test(articleBody)) errors.push(`${file}: article body must not contain an h1; the article layout provides it`);

    const sourceCount = (data.sources?.length || 0) + (data.sourceUrls?.length || 0);
    if (!data.draft && sourceCount === 0) errors.push(`${file}: published factual content needs at least one source`);
    if (data.verificationStatus === 'officially-confirmed') {
      if (!data.lastVerified) errors.push(`${file}: officially confirmed content needs lastVerified`);
      if (!data.factCheckedBy) errors.push(`${file}: officially confirmed content needs an independent fact checker`);
      if (data.factCheckedBy && data.factCheckedBy === data.author) errors.push(`${file}: an author cannot fact-check their own article`);
      const hasPrimary = (data.sources || []).some((source) => source.designation === 'primary') || (data.sourceUrls?.length || 0) > 0;
      if (!hasPrimary) errors.push(`${file}: officially confirmed content needs a primary source`);
    }

    if (data.featuredImage) {
      if (!data.featuredImageAlt?.trim()) errors.push(`${file}: featured images require alt text`);
      const imagePath = join(publicRoot, data.featuredImage.replace(/^\//, ''));
      if (!existsSync(imagePath)) errors.push(`${file}: featured image does not exist: ${data.featuredImage}`);
      else if (statSync(imagePath).size > 350_000) errors.push(`${file}: featured image exceeds the 350 KB hard limit`);
    }
    if (data.featuredImageAvif) {
      const imagePath = join(publicRoot, data.featuredImageAvif.replace(/^\//, ''));
      if (!existsSync(imagePath)) errors.push(`${file}: AVIF image does not exist: ${data.featuredImageAvif}`);
      else if (statSync(imagePath).size > 250_000) errors.push(`${file}: AVIF image exceeds 250 KB`);
    }

    const published = asTime(data.date);
    const updated = asTime(data.updated);
    const verified = asTime(data.lastVerified);
    const review = asTime(data.nextReviewDate);
    if (!published) errors.push(`${file}: invalid publication date`);
    if (data.updated && !updated) errors.push(`${file}: invalid updated date`);
    if (published && updated && updated < published) errors.push(`${file}: updated date precedes publication`);
    if (verified && review && review <= verified) errors.push(`${file}: nextReviewDate must follow lastVerified`);

    if (data.contentType === 'job') {
      if (data.category !== 'jobs') errors.push(`${file}: job content must use the jobs category`);
      required(data.job, ['recruitingOrganization', 'postName', 'notificationNumber', 'notificationDate', 'totalVacancies', 'qualification', 'applicationDeadline', 'selectionProcess', 'applicationMode', 'officialNotificationUrl', 'officialApplicationUrl', 'recruitmentStatus'], 'job', file);
      const deadline = asTime(data.job?.applicationDeadline);
      if (deadline && deadline < Date.now() && ['open', 'closing-soon'].includes(data.job?.recruitmentStatus)) errors.push(`${file}: expired job cannot remain open`);
    } else if (data.contentType === 'scheme') {
      if (data.category !== 'projects') errors.push(`${file}: scheme content must use the projects category`);
      required(data.scheme, ['schemeName', 'ministry', 'schemeLevel', 'targetBeneficiaries', 'benefitType', 'eligibilityCriteria', 'applicationProcess', 'applicationMode', 'officialPortal', 'schemeStatus'], 'scheme', file);
    }
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

for (const key of ['urlSlug', 'seoTitle', 'seoDescription']) {
  const seen = new Map();
  for (const { file, data } of articles) {
    const value = data[key];
    if (!value) continue;
    const identity = `${data.language}:${String(value).trim().toLowerCase()}`;
    if (seen.has(identity)) errors.push(`${file}: duplicate ${key} also used by ${seen.get(identity)}`);
    else seen.set(identity, file);
  }
}

const translations = new Map();
for (const { file, data } of articles) {
  const identity = `${data.translationKey}:${data.language}`;
  if (translations.has(identity)) errors.push(`${file}: duplicate language in translation group (also ${translations.get(identity)})`);
  else translations.set(identity, file);
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Content validation passed for ${articles.length} article(s).`);
