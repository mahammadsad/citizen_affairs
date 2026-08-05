import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const contentRoot = join(root, 'src/content/articles');
const artifactRoot = join(root, '.artifacts');
const publicWorkflows = new Set(['published', 'corrected', 'closed']);
const articleExtensions = new Set(['.md', '.mdx']);
const limits = {
  en: { title: 120, descriptionMin: 60, descriptionMax: 300 },
  bn: { title: 150, descriptionMin: 50, descriptionMax: 320 },
  hi: { title: 150, descriptionMin: 50, descriptionMax: 320 }
};
const clickbaitPatterns = [
  /you won['’]?t believe/i,
  /shocking/i,
  /চমকে যাবেন/u,
  /অবিশ্বাস্য/u,
  /हैरान रह जाएंगे/u,
  /चौंकाने वाला/u
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return articleExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function readArticle(path) {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/);
  if (!match) throw new Error('missing YAML frontmatter');
  return {
    data: parse(match[1]),
    body: source.slice(match[0].length).trim()
  };
}

function plainText(value) {
  return String(value || '')
    .replace(/[`*_~>#\[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function proseParagraphs(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) =>
      block &&
      !/^#{1,6}\s/u.test(block) &&
      !/^[-*+]\s/u.test(block) &&
      !/^\d+[.)]\s/u.test(block) &&
      !/^\|/u.test(block) &&
      !/^</u.test(block)
    )
    .map(plainText)
    .filter(Boolean);
}

const reports = [];
const errors = [];
const warnings = [];

for (const path of walk(contentRoot)) {
  const file = relative(root, path);
  try {
    const { data, body } = readArticle(path);
    if (data.draft || !publicWorkflows.has(data.workflowStatus)) continue;

    const articleErrors = [];
    const articleWarnings = [];
    const language = ['en', 'bn', 'hi'].includes(data.language) ? data.language : 'en';
    const languageLimits = limits[language];
    const title = plainText(data.title);
    const description = plainText(data.description);
    const summaries = Array.isArray(data.quickSummary)
      ? data.quickSummary.map(plainText).filter(Boolean)
      : [];
    const paragraphs = proseParagraphs(body);
    const h2Count = (body.match(/^##\s+\S/gmu) || []).length;
    const h3BeforeH2 = /^###\s+/mu.test(body) && !/^##\s+/mu.test(body.slice(0, body.search(/^###\s+/mu)));

    if (title.length < 12) articleErrors.push('headline is too short to explain the update');
    if (title.length > languageLimits.title) {
      articleErrors.push(`headline exceeds ${languageLimits.title} characters`);
    }
    if (description.length < languageLimits.descriptionMin) {
      articleErrors.push(`description is shorter than ${languageLimits.descriptionMin} characters`);
    }
    if (description.length > languageLimits.descriptionMax) {
      articleErrors.push(`description exceeds ${languageLimits.descriptionMax} characters`);
    }
    if (summaries.length < 2 || summaries.length > 5) {
      articleErrors.push('quickSummary must contain 2 to 5 useful points');
    }
    summaries.forEach((summary, index) => {
      if (summary.length > 260) articleErrors.push(`quickSummary item ${index + 1} exceeds 260 characters`);
    });

    if (paragraphs.length === 0) articleErrors.push('article needs an introductory prose paragraph');
    else {
      const intro = paragraphs[0];
      if (intro.length < 55) articleWarnings.push('opening paragraph is very short');
      if (intro.length > 600) articleWarnings.push('opening paragraph is difficult to scan');
      if (plainText(intro).toLocaleLowerCase(language) === title.toLocaleLowerCase(language)) {
        articleErrors.push('opening paragraph duplicates the headline');
      }
    }

    paragraphs.forEach((paragraph, index) => {
      if (paragraph.length > 1000) articleErrors.push(`paragraph ${index + 1} exceeds 1,000 characters`);
      else if (paragraph.length > 700) articleWarnings.push(`paragraph ${index + 1} is longer than recommended`);
    });

    if (plainText(body).length > 1200 && h2Count < 2) {
      articleErrors.push('long article needs at least two descriptive H2 sections');
    }
    if (h3BeforeH2) articleErrors.push('heading hierarchy starts with H3 before H2');
    if (clickbaitPatterns.some((pattern) => pattern.test(title))) {
      articleErrors.push('headline uses clickbait wording instead of the practical outcome');
    }
    if (/[!?]{2,}/u.test(title)) articleWarnings.push('headline uses repeated punctuation');

    articleErrors.forEach((message) => errors.push(`${file}: ${message}`));
    articleWarnings.forEach((message) => warnings.push(`${file}: ${message}`));
    reports.push({
      file,
      language,
      titleLength: title.length,
      descriptionLength: description.length,
      quickSummaryItems: summaries.length,
      paragraphs: paragraphs.length,
      h2Count,
      errors: articleErrors,
      warnings: articleWarnings
    });
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

mkdirSync(artifactRoot, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  publicArticlesReviewed: reports.length,
  errorCount: errors.length,
  warningCount: warnings.length,
  errors,
  warnings,
  articles: reports
};

const reportPath = join(artifactRoot, 'article-quality-report.json');
await import('node:fs/promises').then(({ writeFile }) =>
  writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
);

if (warnings.length) {
  console.warn(`Article quality audit produced ${warnings.length} warning(s):\n- ${warnings.join('\n- ')}`);
}
if (errors.length) {
  console.error(`Article quality audit failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Article quality audit passed for ${reports.length} public article(s).`);
