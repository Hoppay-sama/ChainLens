import type { components } from './api'

// ─── Generated aliases (single source of truth from openapi.json) ─────────────

export type Product         = components['schemas']['ProductResponse']
export type Checkpoint      = components['schemas']['CheckpointResponse']
export type CustodyTransfer = components['schemas']['CustodyTransferResponse']
export type Shipment        = components['schemas']['ShipmentResponse']
export type Anomaly         = components['schemas']['AnomalyResponse']

// ─── Manual interfaces (no clean generated equivalent) ───────────────────────

/** Composite detail view: not a named API schema */
export interface ProductDetail {
  product: Product
  history: Checkpoint[]
  transfers: CustodyTransfer[]
}

/**
 * KPIResponse.bottleneck_locations is emitted as { [key: string]: unknown }[]
 * by openapi-typescript (inline anonymous object in the spec), so we keep
 * KPIData and BottleneckLocation as manual interfaces to preserve field types.
 */
export interface BottleneckLocation {
  location: string
  avg_dwell_hours: number
  incident_count: number
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

/** Not a top-level named schema in openapi.json */
export interface VerificationResult {
  is_registered: boolean
  is_delivered: boolean
  checkpoint_count: number
}
