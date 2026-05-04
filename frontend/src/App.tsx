import { lazy } from 'react'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { rainbowKitConfig } from './config/wagmi'
import EtherealBackground from './components/EtherealBackground'
import Layout from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
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
  return (
    <WagmiProvider config={rainbowKitConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#c8f060',
            accentColorForeground: '#0d0d0d',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
        >
          <BrowserRouter>
            <EtherealBackground />
            <Analytics />
            <SpeedInsights />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/shipments" element={<Shipments />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/verify" element={<Verify />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
