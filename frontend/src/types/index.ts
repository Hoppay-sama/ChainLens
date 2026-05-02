export interface Product {
  id: number
  product_id: string
  name: string
  description: string | null
  metadata_uri: string | null
  manufacturer_address: string
  registered_at: string  // ISO datetime from backend
  block_number: number
  tx_hash: string
}

export interface Checkpoint {
  id: number
  product_id: string
  location: string
  status: string  // "0"=Created, "1"=InTransit, "2"=AtCheckpoint, "3"=Delivered
  handler_address: string
  notes: string | null
  timestamp: string  // ISO datetime
  block_number: number
  tx_hash: string
}

export interface CustodyTransfer {
  id: number
  product_id: string
  from_address: string
  to_address: string
  timestamp: string
  block_number: number
  tx_hash: string
}

export interface ProductDetail {
  product: Product
  history: Checkpoint[]
  transfers: CustodyTransfer[]
}

export interface KPIData {
  avg_transit_time_hours: number | null
  on_time_rate_percent: number | null
  total_shipments: number
  active_shipments: number
  delivered_shipments: number
  avg_checkpoints_per_shipment: number
  bottleneck_locations: BottleneckLocation[]
}

export interface BottleneckLocation {
  location: string
  avg_dwell_hours: number
  incident_count: number
}

export interface Anomaly {
  product_id: string
  transit_time_hours: number
  z_score: number
  severity: 'low' | 'medium' | 'high'
  flagged_at: string
}

export interface VerificationResult {
  is_registered: boolean
  is_delivered: boolean
  checkpoint_count: number
}
