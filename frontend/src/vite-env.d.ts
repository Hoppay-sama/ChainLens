/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_PRODUCT_REGISTRY_CONTRACT: string
  readonly VITE_SHIPMENT_TRACKER_CONTRACT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
