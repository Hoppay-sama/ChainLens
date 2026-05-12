import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
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
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    // Explicitly set VITE_API_URL so the app always fetches from an origin
    // that (a) is allowed by the index.html CSP connect-src directive and
    // (b) matches the API_ORIGINS list in e2e/helpers/routes.ts — ensuring
    // Playwright's CDP route interceptors can fulfil every request.
    // Without this, CI has no frontend/.env and the app falls back to
    // http://localhost:8000, which the CSP blocks before Playwright can intercept.
    env: {
      VITE_API_URL: 'https://chainlens-4qvy.onrender.com',
    },
  },
})