import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { dirname, extname, join, posix, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const artifactDirectory = join(root, '.artifacts');
const brand = JSON.parse(readFileSync(join(root, 'brand.config.json'), 'utf8'));
const siteOrigin = new URL(brand.domain).origin;
const errors = [];
const references = [];
let interactiveControlsSkipped = 0;

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function toRelative(path) {
  return relative(dist, path).replaceAll('\\', '/');
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function targetFileFor(pathname, files) {
  const clean = decodePathname(pathname).replace(/^\/+/, '');
  if (!clean) return files.has('index.html') ? 'index.html' : undefined;
  const withoutTrailingSlash = clean.replace(/\/+$/, '');
  const candidates = pathname.endsWith('/')
    ? [
        extname(withoutTrailingSlash) ? withoutTrailingSlash : '',
        `${withoutTrailingSlash}/index.html`
      ].filter(Boolean)
    : [clean, `${clean}/index.html`, extname(clean) ? '' : `${clean}.html`].filter(Boolean);
  return candidates.find((candidate) => files.has(candidate));
}

function pageUrlFor(file) {
  if (file === 'index.html') return `${siteOrigin}/`;
  if (file.endsWith('/index.html')) return `${siteOrigin}/${file.slice(0, -'index.html'.length)}`;
  return `${siteOrigin}/${file}`;
}

function attributeValues(source, names) {
  const values = [];
  const attributePattern = new RegExp(
    `(?:^|\\s)(${names.join('|')})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'gi'
  );
  for (const match of source.matchAll(attributePattern)) {
    values.push(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return values;
}

function pageIds(source) {
  const ids = new Set();
  for (const match of source.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    ids.add(match[1] ?? match[2] ?? match[3] ?? '');
  }
  return ids;
}

function markupOnly(source) {
  return source
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');
}

function collectHtmlReferences(source) {
  const values = [];
  for (const tagMatch of markupOnly(source).matchAll(/<[^>]+>/g)) {
    const tag = tagMatch[0];
    const name = tag.match(/^<\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
    if (!name || tag.startsWith('</') || tag.startsWith('<!')) continue;

    if (name === 'a' && /\bdata-footer-language(?:\s|=|>)/i.test(tag)) {
      interactiveControlsSkipped += 1;
      continue;
    }
    if (['a', 'area', 'base', 'link'].includes(name)) {
      values.push(...attributeValues(tag, ['href']));
    }
    if (['audio', 'embed', 'iframe', 'img', 'input', 'script', 'source', 'track', 'video'].includes(name)) {
      values.push(...attributeValues(tag, ['src']));
    }
    if (name === 'form') values.push(...attributeValues(tag, ['action']));
    if (name === 'object') values.push(...attributeValues(tag, ['data']));
    if (name === 'video') values.push(...attributeValues(tag, ['poster']));
    if (name === 'img' || name === 'source') {
      for (const srcset of attributeValues(tag, ['srcset'])) {
        for (const candidate of srcset.split(',')) values.push(candidate.trim().split(/\s+/)[0]);
      }
    }
  }
  return values;
}

function collectCssReferences(source) {
  return [...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1]);
}

function shouldSkip(value) {
  return (
    !value ||
    value === '#' ||
    /^(?:data:|blob:|mailto:|tel:|sms:|javascript:)/i.test(value) ||
    /^\{/.test(value)
  );
}

if (!existsSync(dist)) {
  console.error('Internal link validation requires a completed dist build.');
  process.exit(1);
}

const paths = walk(dist);
const fileSet = new Set(paths.map(toRelative));
const htmlFiles = paths.filter((path) => extname(path) === '.html');
const cssFiles = paths.filter((path) => extname(path) === '.css');
const htmlSources = new Map(htmlFiles.map((path) => [toRelative(path), readFileSync(path, 'utf8')]));
const idsByFile = new Map([...htmlSources].map(([file, source]) => [file, pageIds(markupOnly(source))]));

function validateReference(value, sourceFile, sourceUrl) {
  if (shouldSkip(value)) return;
  let url;
  try {
    url = new URL(value, sourceUrl);
  } catch {
    errors.push(`${sourceFile}: invalid URL reference ${value}`);
    return;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== siteOrigin) return;

  const targetFile = targetFileFor(url.pathname, fileSet);
  references.push({ source: sourceFile, value, target: targetFile || url.pathname });
  if (!targetFile) {
    errors.push(`${sourceFile}: missing internal target ${url.pathname}`);
    return;
  }

  if (url.hash && targetFile.endsWith('.html')) {
    const fragment = decodePathname(url.hash.slice(1));
    if (fragment && !idsByFile.get(targetFile)?.has(fragment)) {
      errors.push(`${sourceFile}: missing fragment #${fragment} in ${targetFile}`);
    }
  }
}

for (const [file, source] of htmlSources) {
  const sourceUrl = pageUrlFor(file);
  for (const value of collectHtmlReferences(source)) validateReference(value, file, sourceUrl);
}

for (const path of cssFiles) {
  const file = toRelative(path);
  const source = readFileSync(path, 'utf8');
  const sourceUrl = `${siteOrigin}/${posix.join(dirname(file).replaceAll('\\', '/'), 'placeholder.css')}`;
  for (const value of collectCssReferences(source)) {
    if (!value.startsWith('#')) validateReference(value, file, sourceUrl);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  siteOrigin,
  files: fileSet.size,
  htmlFiles: htmlFiles.length,
  cssFiles: cssFiles.length,
  referencesChecked: references.length,
  uniqueTargets: new Set(references.map((reference) => reference.target)).size,
  interactiveControlsSkipped,
  passed: errors.length === 0,
  errors
};

mkdirSync(artifactDirectory, { recursive: true });
writeFileSync(join(artifactDirectory, 'internal-link-report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error(`Internal link validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const totalBytes = paths.reduce((sum, path) => sum + statSync(path).size, 0);
console.log(
  `Internal link validation passed for ${references.length} reference(s), ${report.uniqueTargets} target(s), ${interactiveControlsSkipped} scripted control(s) and ${fileSet.size} generated file(s) (${totalBytes} bytes).`
);
