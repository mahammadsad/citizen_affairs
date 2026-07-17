import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['.github', 'docs', 'scripts', 'src', 'supabase', 'tests'];
const extensions = new Set(['.astro', '.css', '.html', '.js', '.json', '.md', '.mjs', '.sql', '.toml', '.ts', '.tsx', '.yaml', '.yml']);
const write = process.argv.includes('--write');
const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filename);
    else if (extensions.has(path.extname(entry.name))) files.push(filename);
  }
};
for (const root of roots) await walk(root);

const errors = [];
for (const filename of files) {
  const source = await readFile(filename, 'utf8');
  const normalized = source.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n*$/, '\n');
  if (source !== normalized) {
    if (write) await writeFile(filename, normalized, 'utf8');
    else errors.push(filename);
  }
}
if (errors.length) {
  console.error(`Formatting validation failed:\n${errors.map((file) => `- ${file}`).join('\n')}\nRun npm run format.`);
  process.exit(1);
}
console.log(`Formatting validation passed for ${files.length} text files.`);
