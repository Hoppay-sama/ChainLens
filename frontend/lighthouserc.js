module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/'],
      startServerCommand: 'npx vite preview --port 4173 --host',
      numberOfRuns: 3,
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
