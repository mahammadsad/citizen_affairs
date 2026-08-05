import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const contentRoot = join(root, 'src/content/articles');
const artifactRoot = join(root, '.artifacts');
const brand = JSON.parse(readFileSync(join(root, 'brand.config.json'), 'utf8'));
const activeCategories = [...brand.activeCategoryIds];
const languages = ['en', 'bn', 'hi'];
const publicWorkflows = new Set(['published', 'corrected', 'closed']);
const articleExtensions = new Set(['.md', '.mdx']);
const now = Date.now();
const reviewSoonWindow = now + 30 * 24 * 60 * 60 * 1000;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return articleExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function frontmatter(path) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!match) throw new Error('missing YAML frontmatter');
  return parse(match[1]);
}

function dateTime(value) {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function countBy(records, key) {
  return records.reduce((counts, record) => {
    const value = String(record.data[key] ?? 'missing');
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

const errors = [];
const warnings = [];
const records = [];
const identities = new Map();

for (const path of walk(contentRoot)) {
  const file = relative(root, path);
  try {
    const data = frontmatter(path);
    const identity = `${data.language}:${data.urlSlug}`;
    if (identities.has(identity)) errors.push(`${file}: duplicate route identity also used by ${identities.get(identity)}`);
    else identities.set(identity, file);

    if (!languages.includes(data.language)) errors.push(`${file}: unsupported language ${data.language}`);
    if (!activeCategories.includes(data.category)) errors.push(`${file}: inactive or unknown category ${data.category}`);

    const isPublic = data.draft === false && publicWorkflows.has(data.workflowStatus);
    const sourceCount = (data.sourceUrls?.length || 0) + (data.sources?.length || 0);
    const reviewTime = dateTime(data.nextReviewDate);

    if (isPublic && sourceCount === 0) errors.push(`${file}: public article has no official source`);
    if (isPublic && !data.lastVerified) warnings.push(`${file}: public article has no lastVerified date`);
    if (isPublic && ['under-verification', 'partially-confirmed'].includes(data.verificationStatus)) {
      warnings.push(`${file}: public article remains ${data.verificationStatus}`);
    }
    if (isPublic && !reviewTime) warnings.push(`${file}: public article has no nextReviewDate`);
    if (isPublic && reviewTime && reviewTime <= now) warnings.push(`${file}: editorial review is overdue`);
    else if (isPublic && reviewTime && reviewTime <= reviewSoonWindow) warnings.push(`${file}: editorial review is due within 30 days`);
    if (data.draft === true && sourceCount === 0) warnings.push(`${file}: draft has no official source yet`);

    records.push({ file, data, isPublic, sourceCount, reviewTime });
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

const publicRecords = records.filter((record) => record.isPublic);
const draftRecords = records.filter((record) => record.data.draft === true);
const coverage = Object.fromEntries(
  activeCategories.map((category) => {
    const categoryRecords = records.filter((record) => record.data.category === category);
    const publicCount = categoryRecords.filter((record) => record.isPublic).length;
    const draftCount = categoryRecords.filter((record) => record.data.draft === true).length;
    if (publicCount < 2) warnings.push(`${category}: launch target needs ${2 - publicCount} more public article(s)`);
    return [category, { total: categoryRecords.length, public: publicCount, drafts: draftCount }];
  }),
);

const translationGroups = new Map();
for (const record of records) {
  const key = record.data.translationKey || record.data.urlSlug || record.file;
  if (!translationGroups.has(key)) translationGroups.set(key, new Set());
  translationGroups.get(key).add(record.data.language);
}

const translations = [...translationGroups.entries()].map(([translationKey, present]) => ({
  translationKey,
  languages: [...present].sort(),
  missing: languages.filter((language) => !present.has(language)),
}));

const report = {
  generatedAt: new Date().toISOString(),
  launchTarget: {
    publicArticlesPerCategory: 2,
    totalPublicArticles: activeCategories.length * 2,
    primaryLanguage: 'bn',
  },
  totals: {
    articles: records.length,
    public: publicRecords.length,
    drafts: draftRecords.length,
    errors: errors.length,
    warnings: warnings.length,
  },
  byLanguage: countBy(records, 'language'),
  byCategory: countBy(records, 'category'),
  byWorkflow: countBy(records, 'workflowStatus'),
  byVerification: countBy(records, 'verificationStatus'),
  coverage,
  translations,
  errors,
  warnings,
};

const coverageRows = activeCategories
  .map((category) => `| ${category} | ${coverage[category].public} | ${coverage[category].drafts} | ${coverage[category].total} |`)
  .join('\n');
const warningRows = warnings.length ? warnings.map((warning) => `- ${warning}`).join('\n') : '- None';
const errorRows = errors.length ? errors.map((error) => `- ${error}`).join('\n') : '- None';
const markdown = `# Citizen Affairs editorial launch readiness\n\nGenerated: ${report.generatedAt}\n\n## Inventory\n\n- Total articles: **${records.length}**\n- Public articles: **${publicRecords.length}** / ${report.launchTarget.totalPublicArticles} launch target\n- Hidden drafts: **${draftRecords.length}**\n- Primary launch language: **Bengali**\n\n## Section coverage\n\n| Category | Public | Drafts | Total |\n|---|---:|---:|---:|\n${coverageRows}\n\n## Language coverage\n\n- English: ${report.byLanguage.en || 0}\n- Bengali: ${report.byLanguage.bn || 0}\n- Hindi: ${report.byLanguage.hi || 0}\n\n## Errors\n\n${errorRows}\n\n## Warnings and editorial follow-up\n\n${warningRows}\n`;

mkdirSync(artifactRoot, { recursive: true });
writeFileSync(join(artifactRoot, 'editorial-readiness-report.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(artifactRoot, 'editorial-readiness-summary.md'), markdown);

console.log(`Editorial readiness: ${publicRecords.length} public, ${draftRecords.length} drafts, ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) process.exit(1);
