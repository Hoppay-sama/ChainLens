import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

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

vi.mock('./components/Layout', async () => {
  const { Outlet } = await vi.importActual('react-router-dom')
  return {
    default: () => <Outlet />,
  }
})

vi.mock('./components/ui/LoadingSpinner', () => ({
  default: ({ size }: { size: string }) => <div data-testid={`spinner-${size}`}>Loading</div>,
}))

// Mock page components so the test isolates route-level code-splitting logic
vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Track Beyond The Ordinary</div>,
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
  describe('route-level code splitting (regression: LCP 10.84s)', () => {
    it('eagerly imports Dashboard for the initial route', () => {
      const appPath = resolve(import.meta.dirname, './App.tsx')
      const source = readFileSync(appPath, 'utf-8')

      // The initial route must NOT be lazy-loaded so LCP isn't blocked by a
      // network waterfall (main bundle → React → Dashboard chunk → vendor chunk).
      expect(source).toContain(
        `import Dashboard from './pages/Dashboard'`
      )
    })

    it('lazy-loads all non-initial routes', () => {
      const appPath = resolve(import.meta.dirname, './App.tsx')
      const source = readFileSync(appPath, 'utf-8')

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

    it('renders Dashboard content immediately on the root route without showing a Suspense fallback', () => {
      const { container } = render(<App />)

      // Hero text from the Dashboard page should be present synchronously
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      expect(screen.getByText(/Track Beyond The Ordinary/i)).toBeInTheDocument()

      // Layout's Suspense fallback (spinner) must NOT appear for the eager route
      expect(
        container.querySelector('[data-testid^="spinner-"]')
      ).not.toBeInTheDocument()
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
