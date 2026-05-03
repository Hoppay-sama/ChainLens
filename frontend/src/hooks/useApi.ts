import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, Shipment } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchApi(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`)
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`)
  }
  // Handle empty responses gracefully
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// ─── Existing hooks (unchanged) ───────────────────────────────────────────────

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchApi('/products'),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchApi(`/products/${id}`),
    enabled: !!id,
  })
}

export function useProductHistory(id: string) {
  return useQuery({
    queryKey: ['product-history', id],
    queryFn: () => fetchApi(`/shipments/${id}/history`),
    enabled: !!id,
  })
}

export function useProductTransfers(id: string) {
  return useQuery({
    queryKey: ['product-transfers', id],
    queryFn: () => fetchApi(`/shipments/${id}/transfers`),
    enabled: !!id,
  })
}

export function useKPIData() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: () => fetchApi('/analytics/kpis'),
  })
}

export function useAnomalies() {
  return useQuery({
    queryKey: ['anomalies'],
    queryFn: () => fetchApi('/analytics/anomalies'),
  })
}

export function useBottlenecks(minDwellHours?: number) {
  return useQuery({
    queryKey: ['bottlenecks', minDwellHours],
    queryFn: () => fetchApi(`/analytics/bottlenecks${minDwellHours ? `?min_dwell_hours=${minDwellHours}` : ''}`),
  })
}

export function useVerifyProduct(id: string) {
  return useQuery({
    queryKey: ['verify', id],
    queryFn: () => fetchApi(`/products/${id}/verify`),
    enabled: !!id,
  })
}

export async function exportAnalytics(format: 'csv' | 'pdf', startDate?: string, endDate?: string) {
  const params = new URLSearchParams({ format })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  const response = await fetch(`${API_URL}/analytics/export?${params}`)
  if (!response.ok) throw new Error('Export failed')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `veritras-export.${format}`
  a.click()
  window.URL.revokeObjectURL(url)
}

// ─── Paginated / extended hooks ───────────────────────────────────────────────

interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export function useProductsPaginated(page = 1, limit = 10) {
  const skip = (page - 1) * limit
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', 'paginated', page, limit],
    queryFn: () => fetchApi(`/products?skip=${skip}&limit=${limit}`),
  })
}

export function useShipments(page = 1, limit = 10, status?: string) {
  const skip = (page - 1) * limit
  let endpoint = `/shipments?skip=${skip}&limit=${limit}`
  if (status && status !== 'all') endpoint += `&status=${status}`
  return useQuery<PaginatedResponse<Shipment>>({
    queryKey: ['shipments', page, limit, status],
    queryFn: () => fetchApi(endpoint),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface ProductMutationInput {
  name: string
  manufacturer: string
  metadata_uri?: string
}

export interface ShipmentMutationInput {
  product_id: string
  origin: string
  destination: string
  notes?: string
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProductMutationInput) => {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed to create product')
        throw new Error(err)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductMutationInput }) => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed to update product')
        throw new Error(err)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ShipmentMutationInput) => {
      const response = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed to create shipment')
        throw new Error(err)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ shipment_id, data }: { shipment_id: string; data: Omit<ShipmentMutationInput, 'product_id'> }) => {
      const response = await fetch(`${API_URL}/shipments/${shipment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed to update shipment')
        throw new Error(err)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}
