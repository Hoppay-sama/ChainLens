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

// ── Mock overrides ────────────────────────────────────────────────────────────

vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => ({ isConnected: false, address: undefined }),
    useWriteContract: () => ({ writeContract: vi.fn(), data: undefined, isPending: false, error: null }),
    useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
  }
})

vi.mock('@/hooks/useRegisterProduct', () => ({
  useRegisterProduct: () => ({
    register: vi.fn(),
    hash: undefined,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
  }),
}))

vi.mock('@/hooks/useShipmentTracker', () => ({
  useRecordCheckpoint: () => ({
    record: vi.fn(),
    hash: undefined,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
  }),
  useTransferCustody: () => ({
    transfer: vi.fn(),
    hash: undefined,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
  }),
  StatusLabels: { 0: 'Created', 1: 'In Transit', 2: 'At Checkpoint', 3: 'Delivered' },
}))

vi.mock('@/hooks/useApi', () => ({
  useProductsPaginated: vi.fn(),
  useProduct: vi.fn(),
  useProductHistory: vi.fn(),
  useProductTransfers: vi.fn(),
  useCreateProduct: vi.fn(),
  useUpdateProduct: vi.fn(),
}))

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Products form validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useProductsPaginated).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    } as any)
    vi.mocked(useProduct).mockReturnValue({ data: null, isLoading: false, error: null } as any)
    vi.mocked(useProductHistory).mockReturnValue({ data: null, isLoading: false, error: null } as any)
    vi.mocked(useProductTransfers).mockReturnValue({ data: null, isLoading: false, error: null } as any)
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

  // Open the Add Product modal before each interaction
  const openAddModal = () =>
    fireEvent.click(screen.getByRole('button', { name: /add product/i }))

  it('shows name and address errors when the form is submitted completely empty', async () => {
    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Must be a valid Ethereum address')).toBeInTheDocument()
    })
  })

  it('shows name min-length error when name is exactly 1 character', async () => {
    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Coffee Beans'), {
      target: { value: 'A' },
    })
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: VALID_ADDRESS },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('shows name max-length error when name exceeds 100 characters', async () => {
    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Coffee Beans'), {
      target: { value: 'A'.repeat(101) },
    })
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: VALID_ADDRESS },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(screen.getByText('Name must be at most 100 characters')).toBeInTheDocument()
    })
  })

  it('shows address format error for an invalid Ethereum address', async () => {
    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Coffee Beans'), {
      target: { value: 'Valid Product Name' },
    })
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: 'not-an-ethereum-address' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(screen.getByText('Must be a valid Ethereum address')).toBeInTheDocument()
    })
  })

  it('shows metadata_uri error when an invalid URL is entered', async () => {
    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Coffee Beans'), {
      target: { value: 'Valid Product Name' },
    })
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: VALID_ADDRESS },
    })
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'not-a-valid-url' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(screen.getByText('Must be a valid URL')).toBeInTheDocument()
    })
  })

  it('calls mutateAsync with form data when all required fields are valid (validation passes)', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({})
    vi.mocked(useCreateProduct).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any)

    renderWithProviders(<Products />)
    openAddModal()

    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Coffee Beans'), {
      target: { value: 'Valid Product' },
    })
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: VALID_ADDRESS },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Product' }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Valid Product',
          manufacturer_address: VALID_ADDRESS,
        })
      )
    })
  })
})
