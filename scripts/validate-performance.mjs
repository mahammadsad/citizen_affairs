import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const artifactDirectory = join(root, '.artifacts');
const errors = [];

const budgets = {
  javascriptFile: 160 * 1024,
  javascriptTotal: 320 * 1024,
  cssFile: 220 * 1024,
  cssTotal: 520 * 1024,
  fontFile: 800 * 1024,
  fontTotal: 1600 * 1024,
  serviceWorker: 20 * 1024,
  offlineDocument: 24 * 1024
};

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function fileSize(path) {
  return statSync(path).size;
}

function total(files) {
  return files.reduce((sum, file) => sum + fileSize(file), 0);
}

function enforceFileBudget(files, limit, label) {
  for (const file of files) {
    const size = fileSize(file);
    if (size > limit) {
      errors.push(`${label} exceeds ${limit} bytes: ${relative(dist, file)} (${size})`);
    }
  }
}

if (!existsSync(dist)) {
  console.error('Performance validation requires a completed dist build.');
  process.exit(1);
}

const files = walk(dist);
const javascript = files.filter((file) => ['.js', '.mjs'].includes(extname(file)) && !file.endsWith('/sw.js'));
const css = files.filter((file) => extname(file) === '.css');
const fonts = files.filter((file) => ['.woff', '.woff2', '.ttf', '.otf'].includes(extname(file)));
const htmlFiles = files.filter((file) => extname(file) === '.html');

const javascriptBytes = total(javascript);
const cssBytes = total(css);
const fontBytes = total(fonts);

enforceFileBudget(javascript, budgets.javascriptFile, 'JavaScript file');
enforceFileBudget(css, budgets.cssFile, 'CSS file');
enforceFileBudget(fonts, budgets.fontFile, 'Font file');
if (javascriptBytes > budgets.javascriptTotal) errors.push(`Total JavaScript exceeds ${budgets.javascriptTotal} bytes (${javascriptBytes})`);
if (cssBytes > budgets.cssTotal) errors.push(`Total CSS exceeds ${budgets.cssTotal} bytes (${cssBytes})`);
if (fontBytes > budgets.fontTotal) errors.push(`Total fonts exceed ${budgets.fontTotal} bytes (${fontBytes})`);

const requiredOfflineFiles = [
  'offline/index.html',
  'bn/offline/index.html',
  'hi/offline/index.html'
];
for (const file of requiredOfflineFiles) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    errors.push(`Offline fallback was not generated: ${file}`);
    continue;
  }
  const source = readFileSync(path, 'utf8');
  if (fileSize(path) > budgets.offlineDocument) errors.push(`Offline fallback is oversized: ${file}`);
  if (/<link\b[^>]+rel=["']stylesheet["']/i.test(source)) errors.push(`Offline fallback depends on external CSS: ${file}`);
  if (/<script\b[^>]+src=/i.test(source)) errors.push(`Offline fallback depends on external JavaScript: ${file}`);
  if (!/<meta\b[^>]+name=["']robots["'][^>]+noindex/i.test(source)) errors.push(`Offline fallback is missing noindex: ${file}`);
}

const workerPath = join(dist, 'sw.js');
if (!existsSync(workerPath)) {
  errors.push('sw.js was not generated');
} else {
  const worker = readFileSync(workerPath, 'utf8');
  if (fileSize(workerPath) > budgets.serviceWorker) errors.push('Service worker exceeds the 20 KiB budget');
  for (const contract of [
    "request.mode === 'navigate'",
    "request.destination",
    "CACHE_PREFIX",
    "deployment\\.json",
    "search-index\\.json",
    "(?:admin|staff|api)"
  ]) {
    if (!worker.includes(contract)) errors.push(`Service worker is missing safety contract: ${contract}`);
  }
  if (!/CACHE_NAME\s*=\s*CACHE_PREFIX\s*\+\s*BUILD/.test(worker)) errors.push('Service worker cache is not versioned by build');
  if (!/Cache-Control/i.test(readFileSync(join(root, 'src/pages/sw.js.ts'), 'utf8'))) errors.push('Service worker response is missing a no-cache policy');
}

for (const path of htmlFiles) {
  const file = relative(dist, path).replaceAll('\\', '/');
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)=["'](https?:\/\/[^"']+)/gi)) {
    errors.push(`${file} loads a third-party script or stylesheet: ${match[1]}`);
  }
  if (html.includes('article-hero-image')) {
    const hero = html.match(/<img\b[^>]*class=["'][^"']*article-hero-image[^"']*["'][^>]*>/i)?.[0] || '';
    for (const attribute of ['width=', 'height=', 'loading="eager"', 'fetchpriority="high"', 'decoding="async"']) {
      if (!hero.includes(attribute)) errors.push(`${file}: article hero is missing ${attribute}`);
    }
  }
}

for (const path of css) {
  const source = readFileSync(path, 'utf8');
  if (/https?:\/\//i.test(source)) errors.push(`${relative(dist, path)} contains a remote CSS/font dependency`);
}

const manifestPath = join(dist, 'site.webmanifest');
if (!existsSync(manifestPath)) {
  errors.push('site.webmanifest was not generated');
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!manifest.id || !manifest.scope || !manifest.start_url) errors.push('Manifest is missing id, scope or start_url');
  if (!Array.isArray(manifest.shortcuts) || manifest.shortcuts.length < 2) errors.push('Manifest is missing task shortcuts');
  if (!Array.isArray(manifest.icons) || !manifest.icons.some((icon) => String(icon.purpose || '').includes('maskable'))) {
    errors.push('Manifest is missing a maskable icon declaration');
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  budgets,
  measured: {
    javascriptFiles: javascript.length,
    javascriptBytes,
    cssFiles: css.length,
    cssBytes,
    fontFiles: fonts.length,
    fontBytes,
    htmlFiles: htmlFiles.length,
    serviceWorkerBytes: existsSync(workerPath) ? fileSize(workerPath) : null
  },
  passed: errors.length === 0,
  errors
};
mkdirSync(artifactDirectory, { recursive: true });
writeFileSync(join(artifactDirectory, 'performance-resilience-report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error(`Performance and resilience validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Performance budgets passed: JS ${javascriptBytes} B, CSS ${cssBytes} B, fonts ${fontBytes} B, ${htmlFiles.length} HTML files.`);
