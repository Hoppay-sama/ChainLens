import { lazy, useMemo } from 'react'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Toaster } from 'sonner'
import { rainbowKitConfig } from './config/wagmi'
import EtherealBackground from './components/EtherealBackground'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

const Products = lazy(() => import('./pages/Products'))
const Shipments = lazy(() => import('./pages/Shipments'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const Verify = lazy(() => import('./pages/Verify'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const rainbowTheme = useMemo(
    () =>
      darkTheme({
        accentColor: '#c8f060',
        accentColorForeground: '#0d0d0d',
        borderRadius: 'medium',
        fontStack: 'system',
      }),
    []
  )

  return (
    <WagmiProvider config={rainbowKitConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          <BrowserRouter>
            <EtherealBackground />
            <Analytics />
            <SpeedInsights />
            <Toaster position="top-right" richColors />
            <ErrorBoundary>
              <Routes>
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/shipments" element={<Shipments />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/verify" element={<Verify />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
