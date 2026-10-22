import { defineConfig } from '@playwright/test';
const base = process.env.SITE_BASE || '/';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: `http://127.0.0.1:4296${base}`, browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview -- --port 4296 --strictPort', url: `http://127.0.0.1:4296${base}`, reuseExistingServer: false },
});
