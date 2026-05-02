import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function fetchApi(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`)
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  return response.json()
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
