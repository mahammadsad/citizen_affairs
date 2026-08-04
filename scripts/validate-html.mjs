import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const errors = [];

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, extension);
    return extname(entry.name) === extension ? [path] : [];
  });
}

function internalTarget(href) {
  const path = href.split(/[?#]/, 1)[0];
  if (!path.startsWith('/') || path.startsWith('//')) return undefined;
  const decoded = decodeURI(path);
  const direct = join(dist, decoded);
  if (extname(decoded)) return direct;
  return join(direct, 'index.html');
}

for (const path of walk(dist, '.html')) {
  const file = relative(dist, path);
  const html = readFileSync(path, 'utf8');
  const isUtilityDocument =
    /http-equiv="refresh"/i.test(html) ||
    /name="robots"[^>]+content="noindex/i.test(html) ||
    file.startsWith('google');
  if (isUtilityDocument) continue;
  if (!/<html[^>]+lang="(?:en|bn|hi)"/i.test(html)) errors.push(`${file}: missing valid html lang`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${file}: missing title`);
  if (!/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(html)) {
    errors.push(`${file}: missing meta description`);
  }
  if (!/<link[^>]+rel="canonical"[^>]+href="https:\/\/citizenaffairs\.in\//i.test(html)) {
    errors.push(`${file}: missing canonical URL`);
  }
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]*"/i.test(image[0])) errors.push(`${file}: image is missing alt text`);
    if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) {
      errors.push(`${file}: image is missing width or height`);
    }
  }

  for (const script of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch {
      errors.push(`${file}: invalid JSON-LD`);
    }
  }

  for (const link of html.matchAll(/<a\b[^>]+href="([^"]+)"/gi)) {
    const target = internalTarget(link[1]);
    if (target && !existsSync(target)) errors.push(`${file}: broken internal link ${link[1]}`);
  }
}

for (const active of ['jobs', 'exams', 'materials', 'projects', 'affairs', 'notices', 'guides']) {
  if (!existsSync(join(dist, 'en/categories', active, 'index.html'))) {
    errors.push(`active category was not generated: ${active}`);
  }
}

const homepage = readFileSync(join(dist, 'index.html'), 'utf8');
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
if ((homepage.match(/class="portal-brand-logo"/g) || []).length !== 1) {
  errors.push('homepage must contain exactly one portal header logo');
}
if (/Citizen Affairs Publication System Test/i.test(homepage + sitemap)) {
  errors.push('technical publication test content entered production discovery output');
}
if (/Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র/i.test(homepage)) {
  errors.push('legacy brand is visible on the homepage');
}
if (!existsSync(join(dist, '404.html'))) errors.push('custom 404.html was not generated');
if (!/noindex,\s*nofollow/i.test(readFileSync(join(dist, 'staff/index.html'), 'utf8'))) {
  errors.push('staff workspace must be noindex, nofollow');
}
if (/\/search\//.test(sitemap)) errors.push('internal search route must not appear in sitemap');

if (errors.length) {
  console.error(`Generated HTML validation failed with ${errors.length} error(s):\n- ${[...new Set(errors)].join('\n- ')}`);
  process.exit(1);
}

console.log('Generated HTML validation passed.');
