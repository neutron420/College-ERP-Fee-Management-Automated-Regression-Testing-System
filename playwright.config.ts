import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    launchOptions: {
      slowMo: 800, // 800ms delay between actions so all animations and clicks are clearly visible
    },
  },
});
