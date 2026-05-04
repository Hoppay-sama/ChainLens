import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze'
      ? visualizer({ open: false, gzipSize: true, filename: 'dist/stats.html' })
      : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'charts-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
}))
