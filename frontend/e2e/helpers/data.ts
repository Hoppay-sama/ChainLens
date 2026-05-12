/**
 * Typed mock constants for Playwright E2E tests.
 *
 * These objects mirror the shapes returned by the FastAPI backend. They are
 * plain JavaScript literals (no Zod, no imports from src/) so that spec files
 * remain self-contained and independent of the project's TypeScript aliases.
 */

const MANUFACTURER_ADDRESS = '0xabcdef1234567890abcdef1234567890abcdef12'
const NOW = '2026-05-12T10:00:00Z'

// ─── Products ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS = [
  {
    id: 1,
    product_id: 'PROD-001',
    name: 'Alpha Widget',
    manufacturer_address: MANUFACTURER_ADDRESS,
    description: 'A precision-engineered widget',
    metadata_uri: null,
    registered_at: NOW,
    block_number: 1000,
    tx_hash: '0xabc',
  },
  {
    id: 2,
    product_id: 'PROD-002',
    name: 'Beta Gadget',
    manufacturer_address: MANUFACTURER_ADDRESS,
    description: null,
    metadata_uri: null,
    registered_at: NOW,
    block_number: 1001,
    tx_hash: '0xdef',
  },
]

/** Response for GET /products?skip=N&limit=10 — used by Products table (paginated). */
export const MOCK_PAGINATED_PRODUCTS = {
  items: MOCK_PRODUCTS,
  total: 25, // >10 so the Next pagination button is enabled (totalPages = 3)
}

/** Response for GET /products?skip=0&limit=100 — used by ProductCombobox. */
export const MOCK_PRODUCT_LIST = {
  items: MOCK_PRODUCTS,
  total: 2,
}

/** Response for GET /products/:id — shape is { product: ProductResponse } */
export const MOCK_PRODUCT_DETAIL = {
  product: MOCK_PRODUCTS[0],
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export const MOCK_SHIPMENTS = {
  items: [
    {
      id: 1,
      shipment_id: 'SHP-001',
      product_id: 'PROD-001',
      origin: 'Shanghai',
      destination: 'Rotterdam',
      status: '0',
      notes: null,
      created_at: NOW,
      updated_at: NOW,
      block_number: 2000,
      tx_hash: '0xghi',
    },
    {
      id: 2,
      shipment_id: 'SHP-002',
      product_id: 'PROD-002',
      origin: 'New York',
      destination: 'London',
      status: '1',
      notes: 'Expedited',
      created_at: NOW,
      updated_at: NOW,
      block_number: 2001,
      tx_hash: '0xjkl',
    },
  ],
  total: 2,
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MOCK_KPI = {
  avg_transit_time_hours: 24.5,
  on_time_rate_percent: 87.3,
  total_shipments: 142,
  active_shipments: 23,
  delivered_shipments: 119,
  avg_checkpoints_per_shipment: 3.2,
  bottleneck_locations: [],
}

export const MOCK_DAILY_VOLUME = {
  items: [
    { name: 'Mon', date: '2026-05-06', shipments: 5, products: 3 },
    { name: 'Tue', date: '2026-05-07', shipments: 8, products: 4 },
    { name: 'Wed', date: '2026-05-08', shipments: 6, products: 2 },
  ],
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export const MOCK_VERIFY_OK = {
  is_registered: true,
  is_delivered: false,
  checkpoint_count: 3,
}

export const MOCK_VERIFY_FAIL = {
  is_registered: false,
  is_delivered: false,
  checkpoint_count: 0,
}
