import { execFileSync } from 'node:child_process';
import { readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const baseRef = process.argv[2] || 'origin/main';
const maxBytes = 350 * 1024;
const supported = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const changed = execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((filename) => filename.startsWith('public/uploads/') && supported.has(path.extname(filename).toLowerCase()));

const walkMarkdown = async (directory, files = []) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await walkMarkdown(filename, files);
    else if (entry.isFile() && path.extname(entry.name) === '.md') files.push(filename);
  }
  return files;
};

const articleFiles = await walkMarkdown(path.join('src', 'content', 'articles'));

const replaceArticleReference = async (oldFilename, newFilename) => {
  const oldUrl = `/${oldFilename.slice('public/'.length).split(path.sep).join('/')}`;
  const newUrl = `/${newFilename.slice('public/'.length).split(path.sep).join('/')}`;
  for (const article of articleFiles) {
    const source = await readFile(article, 'utf8');
    if (!source.includes(oldUrl)) continue;
    await writeFile(article, source.split(oldUrl).join(newUrl), 'utf8');
  }
};

for (const filename of changed) {
  const originalSize = (await stat(filename)).size;
  if (originalSize <= maxBytes) continue;

  const extension = path.extname(filename).toLowerCase();
  const target = extension === '.webp' ? filename : `${filename.slice(0, -extension.length)}.webp`;
  const temporary = `${target}.cms-optimized.tmp`;
  let optimizedSize = Number.POSITIVE_INFINITY;

  const attempts = [
    { width: 1600, quality: 82 },
    { width: 1400, quality: 78 },
    { width: 1200, quality: 76 },
    { width: 1100, quality: 72 },
    { width: 960, quality: 68 },
    { width: 800, quality: 64 },
  ];

  for (const attempt of attempts) {
    await sharp(filename)
      .rotate()
      .resize({ width: attempt.width, withoutEnlargement: true })
      .webp({ quality: attempt.quality, effort: 6 })
      .toFile(temporary);
    optimizedSize = (await stat(temporary)).size;
    if (optimizedSize <= maxBytes) break;
  }

  if (optimizedSize > maxBytes) {
    await unlink(temporary).catch(() => {});
    throw new Error(`${filename} could not be reduced below the 350 KB featured-image limit`);
  }

  await rename(temporary, target);
  if (target !== filename) {
    await unlink(filename);
    await replaceArticleReference(filename, target);
  }

  console.log(`${filename}: ${Math.round(originalSize / 1024)} KB -> ${Math.round(optimizedSize / 1024)} KB${target !== filename ? ` (${target})` : ''}`);
}

if (!changed.length) console.log('No changed CMS images need optimization.');
