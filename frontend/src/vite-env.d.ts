/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_PRODUCT_REGISTRY_CONTRACT: string
  readonly VITE_SHIPMENT_TRACKER_CONTRACT: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  requestIdleCallback: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number
  cancelIdleCallback: (handle: number) => void
}
