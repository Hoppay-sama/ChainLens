import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import Shipments from './Shipments'
import { useShipments, useCreateShipment, useUpdateShipment } from '@/hooks/useApi'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/hooks/useApi', () => ({
  useShipments: vi.fn(),
  useCreateShipment: vi.fn(),
  useUpdateShipment: vi.fn(),
}))

const mockShipments = [
  { id: 1, shipment_id: 'SHIP-001', product_id: 'PROD-001', origin: 'NYC', destination: 'LA', status: '1', created_at: '2024-01-15T10:00:00Z' },
  { id: 2, shipment_id: 'SHIP-002', product_id: 'PROD-002', origin: 'LA', destination: 'SF', status: '3', created_at: '2024-02-20T12:00:00Z' },
]

describe('Shipments', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useShipments).mockReturnValue({
      data: { items: mockShipments, total: 12 },
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useCreateShipment).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    } as any)

    vi.mocked(useUpdateShipment).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    } as any)
  })

  it('renders shipment table with data', () => {
    renderWithProviders(<Shipments />)

    expect(screen.getByText('SHIP-001')).toBeInTheDocument()
    expect(screen.getByText('SHIP-002')).toBeInTheDocument()
    expect(screen.getByText('NYC')).toBeInTheDocument()
    expect(screen.getAllByText('LA')).toHaveLength(2)
    expect(screen.getByText('SF')).toBeInTheDocument()
  })

  it('renders status filter dropdown', () => {
    renderWithProviders(<Shipments />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    fireEvent.change(select, { target: { value: '1' } })

    expect(vi.mocked(useShipments)).toHaveBeenCalledWith(1, 10, '1')
  })

  it('renders pagination controls', () => {
    renderWithProviders(<Shipments />)

    // Use a custom matcher because "Page 1 of 2" is split across multiple elements
    const paginations = screen.getAllByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent?.includes('Page 1 of 2')
    })
    expect(paginations.length).toBeGreaterThanOrEqual(1)

    expect(screen.getByTestId('icon-ChevronLeft').closest('button')).toBeInTheDocument()
    expect(screen.getByTestId('icon-ChevronRight').closest('button')).toBeInTheDocument()
  })
})
