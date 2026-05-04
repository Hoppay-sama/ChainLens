import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Mock heavy providers so tests stay fast and deterministic ───
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  darkTheme: () => ({}),
}))

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: class {
    defaultOptions = {}
  },
  QueryClientProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => null,
}))

vi.mock('./config/wagmi', () => ({
  rainbowKitConfig: {},
}))

vi.mock('./components/EtherealBackground', () => ({
  default: () => null,
}))

vi.mock('./components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('./components/ui/LoadingSpinner', () => ({
  default: ({ size }: { size: string }) => <div data-testid={`spinner-${size}`}>Loading</div>,
}))

// Mock page components so the test isolates route-level code-splitting logic
vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}))

vi.mock('./pages/Products', () => ({
  default: () => <div data-testid="products-page">Products</div>,
}))

vi.mock('./pages/Shipments', () => ({
  default: () => <div data-testid="shipments-page">Shipments</div>,
}))

vi.mock('./pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics</div>,
}))

vi.mock('./pages/Verify', () => ({
  default: () => <div data-testid="verify-page">Verify</div>,
}))

// ─── Tests ───

describe('App', () => {
  describe('route-level code splitting (regression: FCP 11.46s)', () => {
    it('uses React.lazy for all five page components', () => {
      const appPath = resolve(import.meta.dirname, './App.tsx')
      const source = readFileSync(appPath, 'utf-8')

      // Reject eager imports from ./pages/ — this was the original bug
      const eagerPageImports = source.match(
        /^import\s+\w+\s+from\s+['"]\.\/pages\//gm
      )
      expect(eagerPageImports).toBeNull()

      // Assert each route is wrapped in lazy()
      expect(source).toContain(
        `const Dashboard = lazy(() => import('./pages/Dashboard'))`
      )
      expect(source).toContain(
        `const Products = lazy(() => import('./pages/Products'))`
      )
      expect(source).toContain(
        `const Shipments = lazy(() => import('./pages/Shipments'))`
      )
      expect(source).toContain(
        `const AnalyticsPage = lazy(() => import('./pages/Analytics'))`
      )
      expect(source).toContain(
        `const Verify = lazy(() => import('./pages/Verify'))`
      )
    })

    it('wraps routes in Suspense with a fallback UI', () => {
      const layoutPath = resolve(import.meta.dirname, './components/Layout.tsx')
      const layoutSource = readFileSync(layoutPath, 'utf-8')

      expect(layoutSource).toContain('<Suspense')
      expect(layoutSource).toContain('fallback=')

      const appPath = resolve(import.meta.dirname, './App.tsx')
      const appSource = readFileSync(appPath, 'utf-8')
      expect(appSource).toContain('<Routes>')
      expect(appSource).toContain('<Route')
    })
  })
})
