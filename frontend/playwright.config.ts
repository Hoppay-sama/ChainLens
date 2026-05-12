import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    // Dedicated test server on port 3001 — does not conflict with the dev
    // server on 3000, and always uses VITE_API_URL=http://localhost:8000 so
    // route interceptors in specs can fulfil requests locally.
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Run on a dedicated port so we don't conflict with the dev server on 3000.
    // VITE_API_URL is left as-is from frontend/.env (https://chainlens-4qvy.onrender.com)
    // so the app's CSP connect-src allows the requests and Playwright can intercept them.
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
})
