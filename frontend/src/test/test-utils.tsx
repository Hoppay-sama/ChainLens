import { render } from '@testing-library/react'
import { vi } from 'vitest'
import type { ReactElement, ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  darkTheme: () => ({}),
}))

export function renderWithProviders(ui: ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return render(
    <WagmiProvider config={{} as any}>
      <RainbowKitProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            {ui}
          </QueryClientProvider>
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiProvider>,
    options
  )
}
