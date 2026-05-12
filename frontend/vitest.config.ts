import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', '*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'src/main.tsx',
        'e2e/**',
        '**/*.config.{ts,js,cjs}',
        '**/*.d.ts',
        'node_modules/**',
      ],
      thresholds: {
        statements: 60,
        branches: 62,
        functions: 45,
        lines: 60,
      },
    },
  },
})
