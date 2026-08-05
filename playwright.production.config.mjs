import { defineConfig, devices } from '@playwright/test';

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
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } }
  ]
});
