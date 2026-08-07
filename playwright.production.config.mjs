import { defineConfig, devices } from '@playwright/test';

const offlineFallbackTest = /live service worker provides the multilingual offline fallback/;

export default defineConfig({
  testDir: './tests/production',
  timeout: 180_000,
  workers: 1,
  retries: 0,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'production-smoke-report', open: 'never' }],
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'production-results.json' }]
  ],
  use: {
    baseURL: process.env.PRODUCTION_URL || 'https://citizenaffairs.in',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Playwright's standalone Chromium headless-shell is crashing with SIGSEGV
    // on the hosted Ubuntu runner during longer production suites. Use the
    // installed full Chromium channel (new headless mode) instead; this keeps
    // the browser engine identical while avoiding the unstable shell binary.
    channel: 'chromium'
  },
  projects: [
    {
      name: 'desktop',
      grepInvert: offlineFallbackTest,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile',
      grepInvert: offlineFallbackTest,
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'offline',
      grep: offlineFallbackTest,
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
