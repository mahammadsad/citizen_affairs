import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const brand = JSON.parse(readFileSync(join(root, 'brand.config.json'), 'utf8'));
const site = new URL(brand.domain).origin;
const errors = [];
const noindexUrls = new Set();

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, extension);
    return extname(entry.name) === extension ? [path] : [];
  });
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return result;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => ({
    source: match[0],
    attrs: attributes(match[0]),
  }));
}

function generatedUrl(file) {
  if (file === 'index.html') return `${site}/`;
  if (file.endsWith('/index.html')) return `${site}/${file.slice(0, -'index.html'.length)}`;
  return `${site}/${file}`;
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    const pathname = url.pathname === '/' ? '/' : `${url.pathname.replace(/\/+$/, '')}/`;
    return `${url.origin}${pathname}`;
  } catch {
    return undefined;
  }
}

function schemaTypes(value) {
  if (Array.isArray(value)) return value.flatMap(schemaTypes);
  if (!value || typeof value !== 'object') return [];
  const own = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  const graph = Array.isArray(value['@graph']) ? value['@graph'].flatMap(schemaTypes) : [];
  return [...own.filter(Boolean), ...graph];
}

if (!existsSync(dist)) {
  console.error('SEO validation requires a completed dist build.');
  process.exit(1);
}

const sitemapPath = join(dist, 'sitemap.xml');
if (!existsSync(sitemapPath)) errors.push('sitemap.xml was not generated');
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const sitemapBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
const sitemapLocs = sitemapBlocks.map((block) => block.match(/<loc>([^<]+)<\/loc>/)?.[1]).filter(Boolean);
const sitemapSet = new Set(sitemapLocs);

if (!/xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/.test(sitemap)) {
  errors.push('sitemap is missing the XHTML hreflang namespace');
}
if (sitemapSet.size !== sitemapLocs.length) errors.push('sitemap contains duplicate URLs');
for (const loc of sitemapLocs) {
  if (!loc.startsWith(`${site}/`)) errors.push(`sitemap URL is outside the production origin: ${loc}`);
  if (/\/(?:search|saved|staff)\//.test(new URL(loc).pathname)) {
    errors.push(`utility route entered sitemap: ${loc}`);
  }
}
for (const block of sitemapBlocks) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) continue;
  const alternates = [...block.matchAll(/<xhtml:link[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"[^>]*\/>/g)];
  if (!alternates.some((match) => match[2] === loc)) errors.push(`sitemap cluster lacks a self alternate: ${loc}`);
  if (!alternates.some((match) => match[1] === 'x-default')) errors.push(`sitemap cluster lacks x-default: ${loc}`);
  for (const alternate of alternates) {
    if (!sitemapSet.has(alternate[2])) errors.push(`sitemap alternate is not a listed URL: ${alternate[2]}`);
  }
}

for (const path of walk(dist, '.html')) {
  const file = relative(dist, path).replaceAll('\\', '/');
  if (file === '404.html' || file.startsWith('google')) continue;
  const html = readFileSync(path, 'utf8');
  const pageUrl = generatedUrl(file);
  const htmlLang = html.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1];
  const links = tags(html, 'link');
  const metas = tags(html, 'meta');
  const canonicals = links.filter((tag) => tag.attrs.rel === 'canonical');
  const robots = metas.find((tag) => tag.attrs.name === 'robots')?.attrs.content || '';
  const noindex = /\bnoindex\b/i.test(robots);
  const canonical = canonicals[0]?.attrs.href;

  if (!['en', 'bn', 'hi'].includes(htmlLang)) errors.push(`${file}: invalid or missing html lang`);
  if (canonicals.length !== 1) errors.push(`${file}: expected exactly one canonical link`);
  if (!canonical || !normalizeUrl(canonical)?.startsWith(`${site}/`)) {
    errors.push(`${file}: canonical is missing or outside production`);
  }

  if (noindex) {
    noindexUrls.add(pageUrl);
    continue;
  }

  if (normalizeUrl(canonical) !== normalizeUrl(pageUrl)) {
    errors.push(`${file}: indexable page is not self-canonical`);
  }

  const ogUrl = metas.find((tag) => tag.attrs.property === 'og:url')?.attrs.content;
  if (normalizeUrl(ogUrl) !== normalizeUrl(canonical)) errors.push(`${file}: og:url differs from canonical`);

  const hreflangs = links.filter((tag) => tag.attrs.rel === 'alternate' && tag.attrs.hreflang);
  const selfAlternate = hreflangs.find((tag) => tag.attrs.hreflang === htmlLang);
  if (!selfAlternate || normalizeUrl(selfAlternate.attrs.href) !== normalizeUrl(canonical)) {
    errors.push(`${file}: hreflang self-reference is missing or incorrect`);
  }
  if (!hreflangs.some((tag) => tag.attrs.hreflang === 'x-default')) {
    errors.push(`${file}: x-default alternate is missing`);
  }

  const expectedFeed = htmlLang === 'en' ? `${site}/rss.xml` : `${site}/${htmlLang}/rss.xml`;
  const feed = links.find(
    (tag) => tag.attrs.rel === 'alternate' && tag.attrs.type === 'application/rss+xml'
  );
  if (feed?.attrs.href !== expectedFeed) errors.push(`${file}: locale RSS discovery link is incorrect`);

  const parsedSchemas = [];
  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const schema = JSON.parse(match[1]);
      parsedSchemas.push(schema);
      const contexts = Array.isArray(schema) ? schema.map((item) => item?.['@context']) : [schema?.['@context']];
      if (contexts.some((context) => context && context !== 'https://schema.org')) {
        errors.push(`${file}: JSON-LD uses a non-canonical schema.org context`);
      }
    } catch {
      errors.push(`${file}: invalid JSON-LD`);
    }
  }

  if (/^(?:en|bn|hi)\/articles\/[^/]+\/index\.html$/.test(file)) {
    const types = parsedSchemas.flatMap(schemaTypes);
    if (!types.some((type) => type === 'Article' || type === 'NewsArticle')) {
      errors.push(`${file}: article schema is missing`);
    }
    if (!types.includes('BreadcrumbList')) errors.push(`${file}: breadcrumb schema is missing`);
    if (!types.includes('WebPage')) errors.push(`${file}: WebPage schema is missing`);
  }
}

for (const url of noindexUrls) {
  if (sitemapSet.has(url)) errors.push(`noindex page entered sitemap: ${url}`);
}

const feedExpectations = [
  ['rss.xml', 'en-IN', `${site}/rss.xml`, '/en/articles/'],
  ['bn/rss.xml', 'bn-IN', `${site}/bn/rss.xml`, '/bn/articles/'],
  ['hi/rss.xml', 'hi-IN', `${site}/hi/rss.xml`, '/hi/articles/'],
];
for (const [file, language, selfUrl, articlePath] of feedExpectations) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    errors.push(`${file}: localized feed was not generated`);
    continue;
  }
  const xml = readFileSync(path, 'utf8');
  if (!xml.includes(`<language>${language}</language>`)) errors.push(`${file}: feed language is incorrect`);
  if (!xml.includes(`href="${selfUrl}" rel="self"`)) errors.push(`${file}: Atom self link is incorrect`);
  for (const link of xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)) {
    if (!new URL(link[1]).pathname.startsWith(articlePath)) errors.push(`${file}: contains an item from another language`);
    if (!sitemapSet.has(link[1])) errors.push(`${file}: contains an item excluded from sitemap discovery`);
  }
}

if (errors.length) {
  console.error(`SEO validation failed with ${errors.length} error(s):\n- ${[...new Set(errors)].join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO validation passed for ${sitemapSet.size} sitemap URL(s) and three locale feeds.`);
