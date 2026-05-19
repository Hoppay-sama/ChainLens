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

describe('Dashboard KPI semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useKPIData).mockReturnValue({
      data: {
        total_shipments: 7,
        active_shipments: 3,
        avg_transit_time_hours: null,
        on_time_rate_percent: null,
      },
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

  it('labels total_shipments as Total Shipments', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Total Shipments')).toBeInTheDocument()
    expect(screen.queryByText('Total Products')).not.toBeInTheDocument()
  })
})
