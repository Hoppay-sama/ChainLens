import { useQuery } from '@tanstack/react-query'

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
  a.download = `chainlens-export.${format}`
  a.click()
  window.URL.revokeObjectURL(url)
}
