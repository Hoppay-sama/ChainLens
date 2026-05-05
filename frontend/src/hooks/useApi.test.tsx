import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useProducts,
  useProduct,
  useKPIData,
  useCreateProduct,
} from './useApi'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useApi hooks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('useProducts', () => {
    it('fetches and returns product data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([{ id: 1, name: 'Test Product' }])),
      } as Response)

      const { result } = renderHook(() => useProducts(), { wrapper })

      expect(result.current.isPending).toBe(true)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual([{ id: 1, name: 'Test Product' }])
    })

    it('handles loading state', () => {
      globalThis.fetch = vi.fn(() => new Promise(() => {}))

      const { result } = renderHook(() => useProducts(), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.isFetching).toBe(true)
    })
  })

  describe('useProduct', () => {
    it('does not fetch when id is empty', () => {
      globalThis.fetch = vi.fn()

      const { result } = renderHook(() => useProduct(''), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('fetches when id is provided', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1, name: 'Widget' })),
      } as Response)

      const { result } = renderHook(() => useProduct('PROD-001'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/PROD-001')
      )
      expect(result.current.data).toEqual({ id: 1, name: 'Widget' })
    })
  })

  describe('useKPIData', () => {
    it('returns error when fetch fails', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      } as Response)

      const { result } = renderHook(() => useKPIData(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toContain('500')
      expect(result.current.error?.message).toContain('Server error')
    })

    it('handles empty response gracefully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      } as Response)

      const { result } = renderHook(() => useKPIData(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeNull()
    })
  })

  describe('useCreateProduct', () => {
    it('invalidates products query on success', async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const customWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, product_id: 'PROD-001' }),
      } as Response)

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: customWrapper,
      })

      await result.current.mutateAsync({
        name: 'Test Product',
        manufacturer: '0x1234567890123456789012345678901234567890',
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['products'] })
    })

    it('returns error when mutation fails', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid data'),
      } as Response)

      const { result } = renderHook(() => useCreateProduct(), { wrapper })

      await expect(
        result.current.mutateAsync({
          name: 'Test',
          manufacturer: '0x1234567890123456789012345678901234567890',
        })
      ).rejects.toThrow('Invalid data')
    })
  })
})
