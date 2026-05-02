export interface Product {
  id: string
  name: string
  description?: string
  origin: string
  manufacturer: string
  createdAt: number
  status: 'created' | 'in_transit' | 'delivered' | 'flagged'
  currentHolder: string
  metadata?: Record<string, string>
}

export interface Checkpoint {
  id: number | string
  location: string
  timestamp: number
  actor: string
  action: string
  verified: boolean
  metadata?: Record<string, string>
}

export interface CustodyTransfer {
  from: string
  to: string
  timestamp: number
  transactionHash?: string
}

export interface Shipment {
  id: string
  productId: string
  origin: string
  destination: string
  status: string
  createdAt: number
  estimatedDelivery: number
  actualDelivery?: number
  carrier: string
  checkpoints: Checkpoint[]
}

export interface KPIData {
  totalProducts: number
  activeShipments: number
  avgTransitTime: number
  onTimeRate: number
  totalProductsChange: string
  activeShipmentsChange: string
  avgTransitTimeChange: string
  onTimeRateChange: string
}

export interface Anomaly {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high'
  route: string
  expected: string
  actual: string
  detected: string
  shipmentId: string
}

export interface VerificationResult {
  productId: string
  name: string
  verified: boolean
  blockNumber: number
  transactionHash: string
  verifiedAt: number
  history: {
    action: string
    actor: string
    timestamp: number
    hash: string
  }[]
}
