module.exports = {
  ci: {
    collect: {
      // Use LHCI's built-in static server instead of vite preview.
      // Eliminates server-startup timeout issues on CI runners.
      staticDistDir: './dist',
      numberOfRuns: 3,
      settings: {
        // --disable-features=IsolateOrigins,site-per-process required on
        // GitHub Actions ubuntu-latest (24.04) where AppArmor restricts
        // unprivileged user namespaces needed by Chrome's sandbox.
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-features=IsolateOrigins,site-per-process --disable-background-timer-throttling --disable-renderer-backgrounding --window-size=1920,1080',
        preset: 'desktop',
        maxWaitForFcp: 120000,
        maxWaitForLoad: 120000,
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
