import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4000',
    headless: true,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
