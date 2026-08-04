import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const workflowsDirectory = join(root, '.github', 'workflows');
const artifactDirectory = join(root, '.artifacts');
const reportPath = join(artifactDirectory, 'workflow-maintenance-report.json');

const deprecatedPins = new Map([
  ['34e114876b0b11c390a56381ad16ebd13914f8d5', 'actions/checkout before the Node 24 runtime'],
  ['11d5960a326750d5838078e36cf38b85af677262', 'actions/checkout v4 before the Node 24 runtime'],
  ['49933ea5288caeca8642d1e84afbd3f7d6820020', 'actions/setup-node before the Node 24 runtime'],
  ['ea165f8d65b6e75b540449e92b4886f43607fa02', 'actions/upload-artifact v4'],
  ['56afc609e74202658d3ffba0e8f6dda462b719fa', 'actions/upload-pages-artifact v4'],
  ['d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e', 'actions/deploy-pages v4'],
]);

const forbiddenRuntimeWorkarounds = [
  'ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION',
  'FORCE_JAVASCRIPT_ACTIONS_TO_NODE24',
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    else if (['.yml', '.yaml'].includes(extname(entry.name))) files.push(fullPath);
  }
  return files.sort();
}

const workflowFiles = await listFiles(workflowsDirectory);
const errors = [];
const actions = [];

for (const filePath of workflowFiles) {
  const file = relative(root, filePath).replaceAll('\\', '/');
  const source = await readFile(filePath, 'utf8');
  const lines = source.split(/\r?\n/);

  for (const workaround of forbiddenRuntimeWorkarounds) {
    if (source.includes(workaround)) {
      errors.push({ file, line: null, message: `Forbidden runtime workaround: ${workaround}` });
    }
  }

  lines.forEach((line, index) => {
    const match = line.match(/^\s*uses:\s*([^\s#]+)/);
    if (!match) return;

    const reference = match[1];
    if (reference.startsWith('./') || reference.startsWith('docker://')) return;

    const atIndex = reference.lastIndexOf('@');
    const action = atIndex > 0 ? reference.slice(0, atIndex) : reference;
    const pin = atIndex > 0 ? reference.slice(atIndex + 1) : '';
    actions.push({ file, line: index + 1, action, pin });

    if (!/^[0-9a-f]{40}$/i.test(pin)) {
      errors.push({
        file,
        line: index + 1,
        message: `${reference} must use an immutable 40-character commit SHA`,
      });
      return;
    }

    const deprecatedReason = deprecatedPins.get(pin.toLowerCase());
    if (deprecatedReason) {
      errors.push({
        file,
        line: index + 1,
        message: `${reference} uses a deprecated pin (${deprecatedReason})`,
      });
    }
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  workflowCount: workflowFiles.length,
  externalActionUses: actions.length,
  uniqueActions: [...new Set(actions.map(({ action }) => action))].sort(),
  deprecatedPinsRejected: [...deprecatedPins.keys()],
  errors,
  actions,
};

await mkdir(artifactDirectory, { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (errors.length) {
  console.error(`Workflow maintenance validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    const location = error.line ? `${error.file}:${error.line}` : error.file;
    console.error(`- ${location}: ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Workflow maintenance validation passed for ${workflowFiles.length} workflow(s) and ${actions.length} external action use(s).`);
}
