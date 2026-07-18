import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scanRoots = ['src', 'public', 'dist'].map((name) => join(root, name));
const allowed = new Set(['.astro', '.css', '.html', '.js', '.json', '.mjs', '.svg', '.ts', '.txt', '.xml']);
const patterns = [
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][^"']+/i,
  /sb_secret_[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /github_pat_[A-Za-z0-9_]{30,}/,
];
const failures = [];
function walk(dir) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (allowed.has(extname(entry.name))) {
        const value = readFileSync(path, 'utf8');
        for (const pattern of patterns) if (pattern.test(value)) failures.push(relative(root, path));
      }
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
scanRoots.forEach(walk);
if (failures.length) {
  console.error(`Potential private credential found in: ${[...new Set(failures)].join(', ')}`);
  process.exit(1);
}
console.log('Secret-pattern scan passed.');
