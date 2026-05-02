import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Search, MapPin, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { formatAddress, formatTimestamp } from '@/utils/formatters'

// Mock data for demonstration
const mockProduct = {
  id: 'PROD-8842',
  name: 'Premium Organic Coffee Beans',
  origin: 'Ethiopia, Sidamo Region',
  manufacturer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  createdAt: 1714588800,
  status: 'in_transit' as const,
  currentHolder: '0x8ba1f109551bD432803012645Hac136c82C3e8C9',
  checkpoints: [
    {
      id: 1,
      location: 'Sidamo Farm, Ethiopia',
      timestamp: 1714588800,
      actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      action: 'Harvested & Processed',
      verified: true,
    },
    {
      id: 2,
      location: 'Addis Ababa Export Hub',
      timestamp: 1714675200,
      actor: '0x123d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      action: 'Quality Inspection Passed',
      verified: true,
    },
    {
      id: 3,
      location: 'Port of Djibouti',
      timestamp: 1714761600,
      actor: '0x456d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      action: 'Shipped via Ocean Freight',
      verified: true,
    },
    {
      id: 4,
      location: 'Rotterdam Port, Netherlands',
      timestamp: 1714934400,
      actor: '0x789d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      action: 'Customs Cleared',
      verified: true,
    },
    {
      id: 5,
      location: 'Berlin Distribution Center',
      timestamp: 1715020800,
      actor: '0x8ba1f109551bD432803012645Hac136c82C3e8C9',
      action: 'In Transit to Retailer',
      verified: false,
    },
  ],
  custodyHistory: [
    { from: '0x742d35...0bEb', to: '0x123d35...0bEb', timestamp: 1714675200 },
    { from: '0x123d35...0bEb', to: '0x456d35...0bEb', timestamp: 1714761600 },
    { from: '0x456d35...0bEb', to: '0x789d35...0bEb', timestamp: 1714934400 },
    { from: '0x789d35...0bEb', to: '0x8ba1f1...3e8C9', timestamp: 1715020800 },
  ],
}

export default function Products() {
  const [searchId, setSearchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<typeof mockProduct | null>(null)

  const handleSearch = () => {
    if (!searchId.trim()) return
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setProduct(mockProduct)
      setLoading(false)
    }, 800)
  }

  const statusVariant = {
    created: 'default' as const,
    in_transit: 'blue' as const,
    delivered: 'success' as const,
    flagged: 'error' as const,
  }

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

      {/* Product Details */}
      {product && (
        <div className="space-y-6">
          {/* Product Info Card */}
          <Card variant="accent">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xl font-semibold text-text">
                    {product.id}
                  </h2>
                  <Badge variant={statusVariant[product.status]}>
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="text-lg text-text">{product.name}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {product.origin}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Manufacturer: {formatAddress(product.manufacturer)}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Created {formatTimestamp(product.createdAt)}
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
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                {product.checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id} className="relative flex gap-4 pb-8 last:pb-0">
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        checkpoint.verified
                          ? 'border-accent bg-accent/10'
                          : 'border-muted bg-surface2'
                      }`}
                    >
                      {checkpoint.verified ? (
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text">{checkpoint.action}</p>
                        <span className="font-mono text-xs text-muted">
                          {formatTimestamp(checkpoint.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted">{checkpoint.location}</p>
                      <p className="font-mono text-xs text-muted/60">
                        By {formatAddress(checkpoint.actor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Custody History */}
            <Card>
              <h3 className="mb-6 font-semibold text-text">Custody Transfers</h3>
              <div className="space-y-4">
                {product.custodyHistory.map((transfer, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-surface2 p-3 transition-colors hover:bg-surface2/80"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{transfer.from}</span>
                      <ArrowRight className="h-3 w-3 text-accent" />
                      <span className="font-mono">{transfer.to}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted/60">
                      {formatTimestamp(transfer.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {!product && !loading && (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-16 text-center">
          <Package className="h-12 w-12 text-muted/30" />
          <p className="mt-4 text-muted">Enter a product ID to view its details</p>
        </div>
      )}
    </div>
  )
}
