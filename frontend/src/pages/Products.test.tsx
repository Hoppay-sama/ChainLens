import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Products from './Products'
import {
  useProductsPaginated,
  useProduct,
  useProductHistory,
  useProductTransfers,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/useApi'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/hooks/useApi', () => ({
  useProductsPaginated: vi.fn(),
  useProduct: vi.fn(),
  useProductHistory: vi.fn(),
  useProductTransfers: vi.fn(),
  useCreateProduct: vi.fn(),
  useUpdateProduct: vi.fn(),
}))

const mockProducts = [
  { id: 1, product_id: 'PROD-001', name: 'Widget A', manufacturer_address: '0x1234567890123456789012345678901234567890', registered_at: '2024-01-15T10:00:00Z' },
  { id: 2, product_id: 'PROD-002', name: 'Gadget B', manufacturer_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', registered_at: '2024-02-20T12:00:00Z' },
]

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useProductsPaginated).mockImplementation((...args: any[]) => {
      const search = args[2]
      let items = mockProducts
      if (search) {
        items = mockProducts.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      return {
        data: { items, total: 25 },
        isLoading: false,
        error: null,
      } as any
    })

    vi.mocked(useProduct).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useProductHistory).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useProductTransfers).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(useCreateProduct).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    } as any)

    vi.mocked(useUpdateProduct).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    } as any)
  })

  it('renders product table with data', () => {
    renderWithProviders(<Products />)

    expect(screen.getByText('PROD-001')).toBeInTheDocument()
    expect(screen.getByText('Widget A')).toBeInTheDocument()
    expect(screen.getByText('PROD-002')).toBeInTheDocument()
    expect(screen.getByText('Gadget B')).toBeInTheDocument()
  })

  it('renders pagination controls', () => {
    renderWithProviders(<Products />)

    // Use a custom matcher because "Page 1 of 3" is split across multiple elements
    const paginations = screen.getAllByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent?.includes('Page 1 of 3')
    })
    expect(paginations.length).toBeGreaterThanOrEqual(1)

    expect(screen.getByTestId('icon-ChevronLeft').closest('button')).toBeInTheDocument()
    expect(screen.getByTestId('icon-ChevronRight').closest('button')).toBeInTheDocument()
  })

  it('filters products by name', async () => {
    renderWithProviders(<Products />)

    const searchInput = screen.getByPlaceholderText('Search by product name...')
    fireEvent.change(searchInput, { target: { value: 'Widget' } })

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument()
      expect(screen.queryByText('Gadget B')).not.toBeInTheDocument()
    })
  })

  it('renders empty state when no products match search', async () => {
    renderWithProviders(<Products />)

    const searchInput = screen.getByPlaceholderText('Search by product name...')
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

    await waitFor(() => {
      expect(screen.getByText('No products match your search')).toBeInTheDocument()
    })
  })
})
