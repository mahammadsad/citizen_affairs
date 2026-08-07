import { readFile, writeFile } from 'node:fs/promises';

const packageUrl = new URL('../node_modules/js-yaml/package.json', import.meta.url);
const wrapperUrl = new URL('../node_modules/js-yaml/dist/js-yaml-compat.mjs', import.meta.url);

const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'));
const importTarget = packageJson.exports?.['.']?.import;

if (packageJson.version !== '5.2.2') {
  throw new Error(`Expected js-yaml 5.2.2, found ${packageJson.version ?? 'unknown'}`);
}

if (importTarget !== './dist/js-yaml.mjs' && importTarget !== './dist/js-yaml-compat.mjs') {
  throw new Error(`Unexpected js-yaml ESM entrypoint: ${String(importTarget)}`);
}

await writeFile(
  wrapperUrl,
  "export * from './js-yaml.mjs';\nimport * as yaml from './js-yaml.mjs';\nexport default yaml;\n",
  'utf8',
);

if (importTarget !== './dist/js-yaml-compat.mjs') {
  packageJson.exports['.'].import = './dist/js-yaml-compat.mjs';
  await writeFile(packageUrl, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
}

console.log('Applied js-yaml v5 default-export compatibility shim for Astro.');
