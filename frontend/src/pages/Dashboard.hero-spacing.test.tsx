import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { useKPIData, useProducts, useDailyVolume } from '@/hooks/useApi'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/hooks/useApi', () => ({
  useKPIData: vi.fn(),
  useProducts: vi.fn(),
  useDailyVolume: vi.fn(),
}))

vi.mock('@/hooks/useSSE', () => ({
  useAnalyticsEvents: vi.fn(),
}))

describe('Dashboard hero spacing', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useKPIData).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useProducts).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useDailyVolume).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)
  })

  it('pulls the overview section closer to the hero with controlled transition spacing', () => {
    renderWithProviders(<Dashboard />)

    const overview = screen.getByTestId('dashboard-overview')

    expect(overview).toHaveClass('-mt-12')
    expect(overview).toHaveClass('pt-8')
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })
})
