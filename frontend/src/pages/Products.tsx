import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProduct, useProductHistory, useProductTransfers } from '@/hooks/useApi'
import { Search, MapPin, User, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, Package } from 'lucide-react'
import { formatAddress, formatDate } from '@/utils/formatters'
import type { Checkpoint, CustodyTransfer } from '@/types'

const statusLabels: Record<string, string> = {
  '0': 'Created',
  '1': 'In Transit',
  '2': 'At Checkpoint',
  '3': 'Delivered',
}

const statusVariant: Record<string, 'default' | 'blue' | 'orange' | 'success'> = {
  '0': 'default',
  '1': 'blue',
  '2': 'orange',
  '3': 'success',
}

export default function Products() {
  const [searchId, setSearchId] = useState('')
  const [submittedId, setSubmittedId] = useState('')

  const {
    data: productDetail,
    isLoading: productLoading,
    error: productError,
  } = useProduct(submittedId)

  const {
    data: historyData,
    isLoading: historyLoading,
  } = useProductHistory(submittedId)

  const {
    data: transfersData,
    isLoading: transfersLoading,
  } = useProductTransfers(submittedId)

  const handleSearch = () => {
    if (!searchId.trim()) return
    setSubmittedId(searchId.trim())
  }

  const product = productDetail?.product
  const history: Checkpoint[] = historyData ?? []
  const transfers: CustodyTransfer[] = transfersData ?? []

  const isDelivered = history.some((c) => c.status === '3')

  const loading = productLoading || historyLoading || transfersLoading

  const isNotFound =
    productError instanceof Error &&
    (productError.message.includes('404') || productError.message.includes('not found'))

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">
          Product Lookup
        </h1>
        <p className="max-w-2xl text-muted">
          Search for a product by ID to view its complete blockchain history,
          custody transfers, and verification status.
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Enter product ID (e.g., PROD-8842)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-button border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="min-w-[120px]">
            {loading ? <LoadingSpinner size="sm" /> : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Not Found */}
      {isNotFound && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Product Not Found</p>
            <p className="text-sm text-red-400/70">
              No product with ID &quot;{submittedId}&quot; was found on the blockchain.
            </p>
          </div>
        </div>
      )}

      {/* Error (other than 404) */}
      {productError && !isNotFound && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error</p>
            <p className="text-sm text-red-400/70">
              {productError instanceof Error ? productError.message : 'Failed to load product'}
            </p>
          </div>
        </div>
      )}

      {/* Product Details */}
      {product && !loading && (
        <div className="space-y-6">
          {/* Product Info Card */}
          <Card variant="accent">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xl font-semibold text-text">
                    {product.product_id}
                  </h2>
                  <Badge variant={isDelivered ? 'success' : 'blue'}>
                    {isDelivered ? 'Delivered' : 'In Transit'}
                  </Badge>
                </div>
                <h3 className="text-lg text-text">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Manufacturer: {formatAddress(product.manufacturer_address)}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Registered {formatDate(product.registered_at)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-accent/5 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-accent" />
                <p className="mt-2 text-xs font-medium text-accent">Blockchain Verified</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Shipment Timeline */}
            <Card className="lg:col-span-2">
              <h3 className="mb-6 font-semibold text-text">Shipment Timeline</h3>
              {history.length === 0 ? (
                <p className="text-sm text-muted">No checkpoint history available.</p>
              ) : (
                <div className="relative space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                  {history.map((checkpoint) => (
                    <div key={checkpoint.id} className="relative flex gap-4 pb-8 last:pb-0">
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          checkpoint.status === '3'
                            ? 'border-accent bg-accent/10'
                            : 'border-muted bg-surface2'
                        }`}
                      >
                        {checkpoint.status === '3' ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text">
                            {checkpoint.notes || statusLabels[checkpoint.status] || 'Update'}
                          </p>
                          <span className="font-mono text-xs text-muted">
                            {formatDate(checkpoint.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {checkpoint.location}
                        </p>
                        <Badge variant={statusVariant[checkpoint.status] || 'default'} className="mt-1">
                          {statusLabels[checkpoint.status] || checkpoint.status}
                        </Badge>
                        <p className="font-mono text-xs text-muted/60">
                          By {formatAddress(checkpoint.handler_address)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Custody History */}
            <Card>
              <h3 className="mb-6 font-semibold text-text">Custody Transfers</h3>
              {transfers.length === 0 ? (
                <p className="text-sm text-muted">No custody transfers available.</p>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="rounded-lg bg-surface2 p-3 transition-colors hover:bg-surface2/80"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="font-mono">{formatAddress(transfer.from_address)}</span>
                        <ArrowRight className="h-3 w-3 text-accent" />
                        <span className="font-mono">{formatAddress(transfer.to_address)}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted/60">
                        {formatDate(transfer.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {!product && !loading && !productError && !submittedId && (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-16 text-center">
          <Package className="h-12 w-12 text-muted/30" />
          <p className="mt-4 text-muted">Enter a product ID to view its details</p>
        </div>
      )}
    </div>
  )
}
