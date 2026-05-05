import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import Analytics from './Analytics'
import { useKPIData, useAnomalies, useBottlenecks } from '@/hooks/useApi'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/hooks/useApi', () => ({
  useKPIData: vi.fn(),
  useAnomalies: vi.fn(),
  useBottlenecks: vi.fn(),
  exportAnalytics: vi.fn(),
}))

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useKPIData).mockReturnValue({
      data: {
        total_shipments: 100,
        active_shipments: 30,
        avg_transit_time_hours: 18,
        on_time_rate_percent: 95,
        bottleneck_locations: [
          { location: 'Port of LA', avg_dwell_hours: 48, incident_count: 12 },
          { location: 'Rotterdam', avg_dwell_hours: 36, incident_count: 8 },
        ],
      },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useAnomalies).mockReturnValue({
      data: [
        { product_id: 'PROD-001', transit_time_hours: 72, z_score: 2.5, severity: 'high', flagged_at: '2024-01-15T10:00:00Z' },
      ],
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useBottlenecks).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)
  })

  it('renders charts', () => {
    renderWithProviders(<Analytics />)

    expect(screen.getByText('Volume by Route')).toBeInTheDocument()
    expect(screen.getByText('Bottleneck Locations')).toBeInTheDocument()
    expect(screen.getByText('Transit Time by Route')).toBeInTheDocument()
  })

  it('renders anomaly table with data', () => {
    renderWithProviders(<Analytics />)

    expect(screen.getByText('Flagged Shipments')).toBeInTheDocument()
    expect(screen.getByText('PROD-001')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders export buttons', () => {
    renderWithProviders(<Analytics />)

    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument()
  })

  it('renders loading state', () => {
    vi.mocked(useKPIData).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<Analytics />)

    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })
})
