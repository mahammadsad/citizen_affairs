import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const artifactDirectory = join(root, '.artifacts');
const resultPath = join(root, process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'production-results.json');
const productionUrl = (process.env.PRODUCTION_URL || 'https://citizenaffairs.in').replace(/\/$/, '');
const expectedCommit = process.env.EXPECTED_BUILD_COMMIT || '';
const mergedSetting = process.env.RELEASE_MERGED || 'unknown';
const runId = process.env.GITHUB_RUN_ID || 'local';
const workflowName = process.env.GITHUB_WORKFLOW || 'Production health';
const generatedAt = new Date().toISOString();

function readTestStats() {
  if (!existsSync(resultPath)) {
    return { expected: 0, unexpected: 1, flaky: 0, skipped: 0, available: false };
  }
  try {
    const report = JSON.parse(readFileSync(resultPath, 'utf8'));
    return {
      expected: Number(report.stats?.expected || 0),
      unexpected: Number(report.stats?.unexpected || 0),
      flaky: Number(report.stats?.flaky || 0),
      skipped: Number(report.stats?.skipped || 0),
      available: true
    };
  } catch {
    return { expected: 0, unexpected: 1, flaky: 0, skipped: 0, available: false };
  }
}

async function fetchJson(path) {
  try {
    const response = await fetch(`${productionUrl}${path}?health=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return { ok: false, status: response.status, payload: {} };
    return { ok: true, status: response.status, payload: await response.json() };
  } catch (error) {
    return { ok: false, status: 0, payload: {}, error: error instanceof Error ? error.message : String(error) };
  }
}

const tests = readTestStats();
const [deployment, health] = await Promise.all([
  fetchJson('/deployment.json'),
  fetchJson('/health.json')
]);
const servedCommit = String(deployment.payload.commit || health.payload.commit || 'unavailable');
const merged = mergedSetting === 'true' ? true : mergedSetting === 'false' ? false : null;
const deployed = Boolean(
  deployment.ok &&
  health.ok &&
  (expectedCommit ? servedCommit === expectedCommit : servedCommit !== 'unavailable')
);
const testsPassed = tests.available && tests.unexpected === 0 && tests.expected > 0;
const healthReady = health.ok && health.payload.status === 'ready' && health.payload.scope === 'served-build';
const verifiedLive = deployed && testsPassed && healthReady;
const state = verifiedLive ? 'verified-live' : 'attention-required';

const report = {
  generatedAt,
  state,
  productionUrl,
  workflow: workflowName,
  runId,
  stages: {
    merged: {
      status: merged,
      targetCommit: expectedCommit || null,
      note: merged === null ? 'Not evaluated by this scheduled/manual health run.' : undefined
    },
    deployed: {
      status: deployed,
      servedCommit,
      exactTargetMatch: expectedCommit ? servedCommit === expectedCommit : null,
      markerAvailable: deployment.ok,
      healthAvailable: health.ok
    },
    verifiedLive: {
      status: verifiedLive,
      testsPassed,
      healthReady
    }
  },
  tests,
  endpoints: {
    deployment: { ok: deployment.ok, status: deployment.status },
    health: { ok: health.ok, status: health.status }
  }
};

const icon = verifiedLive ? '✅' : '❌';
const stageIcon = (value) => value === true ? '✅' : value === false ? '❌' : '➖';
const markdown = `# Citizen Affairs production health

**Overall:** ${icon} ${verifiedLive ? 'Verified live' : 'Attention required'}

| Release stage | Status | Evidence |
|---|---:|---|
| Merged | ${stageIcon(merged)} | ${merged === null ? 'Not evaluated in this run' : expectedCommit || 'Main-branch workflow'} |
| Deployed | ${stageIcon(deployed)} | Served commit: \`${servedCommit}\` |
| Verified live | ${stageIcon(verifiedLive)} | ${tests.expected} passed, ${tests.unexpected} failed, ${tests.flaky} flaky |

- **Production:** ${productionUrl}
- **Health contract:** ${health.ok ? 'available' : `unavailable (HTTP ${health.status || 'error'})`}
- **Deployment marker:** ${deployment.ok ? 'available' : `unavailable (HTTP ${deployment.status || 'error'})`}
- **Workflow run:** ${runId}
- **Generated:** ${generatedAt}

> “Merged”, “deployed” and “verified live” are separate stages. A served commit is not marked verified until the complete production browser suite passes.
`;

mkdirSync(artifactDirectory, { recursive: true });
writeFileSync(join(artifactDirectory, 'production-health-report.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(artifactDirectory, 'production-health-summary.md'), markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
