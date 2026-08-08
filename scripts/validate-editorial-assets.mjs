import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const registry = JSON.parse(readFileSync(path.join(root, 'src/data/editorial-assets.json'), 'utf8'));
const errors = [];
const warnings = [];
const required = ['id', 'assetKind', 'sourcePath', 'derivatives', 'creatorSource', 'licence', 'aiAssisted', 'createdAt', 'associatedArticles', 'editorialOwner', 'lastVisualReview', 'reviewStatus', 'reviewer', 'mobile390Reviewed', 'desktop1440Reviewed'];
const derivativeOwner = new Map();
const prohibited = /Sarkari Tathya Kendra|সরকারি তথ্যকেন্দ্র|सरकारी तथ्य केंद्र|official\s+info\s+verified|\bverified\s+(?:update|guide|information)\b/i;
const illustratedDomain = /(?:https?:\/\/(?!www\.w3\.org\/2000\/svg)|www\.|\b[a-z0-9-]+\.(?:gov\.in|nic\.in|com|org|net|in)(?:\/|\b))/i;

for (const asset of registry.assets || []) {
  for (const field of required) {
    const value = asset[field];
    const emptyArrayIsAllowed = field === 'associatedArticles' && asset.assetKind === 'template';
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0 && !emptyArrayIsAllowed)) errors.push(`${asset.id || 'unknown'}: ${field} is required`);
  }
  const sourceFile = path.join(root, asset.sourcePath || '');
  if (!existsSync(sourceFile)) errors.push(`${asset.id}: source file is missing`);
  else {
    const source = readFileSync(sourceFile, 'utf8');
    const editorialContent = source.replace('http://www.w3.org/2000/svg', '');
    if (/<text\b/i.test(source)) errors.push(`${asset.id}: source SVG must not embed critical text`);
    if (prohibited.test(editorialContent)) errors.push(`${asset.id}: source contains a prohibited trust or retired-brand claim`);
    if (illustratedDomain.test(editorialContent)) errors.push(`${asset.id}: source contains an illustrated website domain`);
  }
  if (!asset.mobile390Reviewed || !asset.desktop1440Reviewed) {
    if (asset.assetKind === 'template') warnings.push(`${asset.id}: template viewport review is pending; it cannot be assigned to an article`);
    else errors.push(`${asset.id}: implementation visual review is incomplete`);
  }
  if (asset.humanOwnerApprovalRequiredBeforePublish && asset.reviewStatus !== 'approved-by-owner') warnings.push(`${asset.id}: human owner visual approval is still required before remote publication`);
  for (const derivative of asset.derivatives || []) {
    if (derivativeOwner.has(derivative)) errors.push(`${derivative}: registered to more than one asset`);
    derivativeOwner.set(derivative, asset.id);
    if (!existsSync(path.join(root, 'public', derivative.replace(/^\//, '')))) errors.push(`${asset.id}: derivative is missing: ${derivative}`);
  }
}

for (const asset of registry.assets || []) {
  for (const derivative of asset.derivatives || []) {
    const expectedWidth = Number(derivative.match(/-(480|768|1200)\.(?:webp|avif)$/)?.[1]);
    if (!expectedWidth) continue;
    const metadata = await sharp(path.join(root, 'public', derivative.replace(/^\//, ''))).metadata();
    if (metadata.width !== expectedWidth || metadata.height !== Math.round(expectedWidth * 9 / 16)) errors.push(`${derivative}: expected ${expectedWidth} × ${Math.round(expectedWidth * 9 / 16)}`);
  }
}

for (const asset of registry.assets || []) {
  for (const articlePath of asset.associatedArticles || []) {
    if (!existsSync(path.join(root, articlePath))) errors.push(`${asset.id}: associated article is missing: ${articlePath}`);
  }
}

const articlePaths = (registry.assets || []).flatMap((asset) => asset.associatedArticles || []);
for (const articlePath of new Set(articlePaths)) {
  const source = readFileSync(path.join(root, articlePath), 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
  const data = match ? parse(match[1]) : {};
  for (const field of ['featuredImage', 'featuredImageAvif']) {
    if (data[field] && !derivativeOwner.has(data[field])) errors.push(`${articlePath}: ${field} is not registered: ${data[field]}`);
  }
  for (const field of ['featuredImageSrcSet', 'featuredImageAvifSrcSet']) {
    for (const item of String(data[field] || '').split(',').map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean)) {
      if (!derivativeOwner.has(item)) errors.push(`${articlePath}: ${field} contains an unregistered derivative: ${item}`);
    }
  }
}

if (errors.length) {
  console.error(`Editorial asset validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
for (const warning of warnings) console.warn(`Editorial asset review pending: ${warning}`);
console.log(`Editorial asset validation passed for ${registry.assets.length} registered asset(s).`);
