import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Search, QrCode, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { formatAddress, formatTimestamp } from '@/utils/formatters'

type VerificationStatus = 'idle' | 'loading' | 'verified' | 'failed'

const mockVerification = {
  productId: 'PROD-8842',
  name: 'Premium Organic Coffee Beans',
  verified: true,
  blockNumber: 18472931,
  transactionHash: '0x7f8c9d...3e4f5a',
  verifiedAt: 1715020800,
  history: [
    {
      action: 'Product Registered',
      actor: '0x742d35...0bEb',
      timestamp: 1714588800,
      hash: '0x1a2b3c...4d5e6f',
    },
    {
      action: 'Ownership Transferred',
      actor: '0x123d35...0bEb',
      timestamp: 1714675200,
      hash: '0x2b3c4d...5e6f7a',
    },
    {
      action: 'Shipment Created',
      actor: '0x456d35...0bEb',
      timestamp: 1714761600,
      hash: '0x3c4d5e...6f7a8b',
    },
    {
      action: 'Delivery Confirmed',
      actor: '0x8ba1f1...3e8C9',
      timestamp: 1715020800,
      hash: '0x4d5e6f...7a8b9c',
    },
  ],
}

export default function Verify() {
  const [inputId, setInputId] = useState('')
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [result, setResult] = useState<typeof mockVerification | null>(null)

  const handleVerify = () => {
    if (!inputId.trim()) return
    setStatus('loading')
    setResult(null)

    setTimeout(() => {
      if (inputId.toUpperCase() === 'PROD-8842') {
        setStatus('verified')
        setResult(mockVerification)
      } else {
        setStatus('failed')
      }
    }, 1200)
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl text-text sm:text-4xl">
          Verify Authenticity
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Enter a product ID or scan a QR code to verify its authenticity
          and view its complete blockchain history.
        </p>
      </div>

      {/* Verification Input */}
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Enter product ID or scan QR"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="w-full rounded-button border border-border bg-bg py-3 pl-10 pr-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={status === 'loading'}
                className="min-w-[140px]"
              >
                {status === 'loading' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>
              <Button variant="secondary" className="px-4">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Messages */}
            {status === 'failed' && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-medium text-red-400">Verification Failed</p>
                  <p className="text-sm text-red-400/70">
                    Product ID not found on the blockchain. This may indicate a counterfeit product.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Verification Result */}
      {status === 'verified' && result && (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Success Banner */}
          <div className="flex items-center gap-3 rounded-card border border-accent/20 bg-accent/5 p-6">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <p className="font-semibold text-accent">Authentic Product Verified</p>
              <p className="text-sm text-accent/70">
                This product has been verified on the blockchain at block{' '}
                <span className="font-mono">{result.blockNumber.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Product Info */}
          <Card variant="accent">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Product ID</p>
                  <p className="font-mono text-lg text-text">{result.productId}</p>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
              <div>
                <p className="text-sm text-muted">Product Name</p>
                <p className="text-text">{result.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted">Transaction</p>
                  <p className="font-mono text-sm text-text">{result.transactionHash}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Verified At</p>
                  <p className="text-sm text-text">{formatTimestamp(result.verifiedAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain History */}
          <Card>
            <h3 className="mb-6 font-semibold text-text">Blockchain History</h3>
            <div className="space-y-4">
              {result.history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg bg-surface2 p-4 transition-colors hover:bg-surface2/80"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <span className="font-mono text-xs text-accent">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text">{item.action}</p>
                      <span className="font-mono text-xs text-muted">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted">By {formatAddress(item.actor)}</p>
                    <p className="font-mono text-xs text-muted/50">{item.hash}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Initial State Helper */}
      {status === 'idle' && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-card border border-dashed border-border bg-surface/50 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-muted/30" />
            <p className="mt-4 text-muted">Try verifying with product ID: PROD-8842</p>
          </div>
        </div>
      )}
    </div>
  )
}
