import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'line',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    locale: 'bn-IN',
    colorScheme: 'light',
  },
  webServer: {
    command: 'python3 -m http.server 4321 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4321/bn/articles/india-major-welfare-schemes-official-guide/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
