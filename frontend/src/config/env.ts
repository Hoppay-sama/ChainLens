const REQUIRED_VARS = [
  {
    key: 'VITE_API_URL',
    placeholder: 'http://localhost:8000',
  },
  {
    key: 'VITE_PRODUCT_REGISTRY_CONTRACT',
    placeholder: '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'VITE_SHIPMENT_TRACKER_CONTRACT',
    placeholder: '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'VITE_WALLETCONNECT_PROJECT_ID',
    placeholder: 'your_project_id_here',
  },
] as const

/**
 * Validates required environment variables at app startup.
 * Logs warnings for missing or placeholder values without crashing the app.
 */
export function validateEnv(): void {
  const warnings: string[] = []

  for (const { key, placeholder } of REQUIRED_VARS) {
    const value = import.meta.env[key]
    if (!value || value === placeholder) {
      warnings.push(`  - ${key} is missing or using a placeholder value`)
    }
  }

  if (warnings.length > 0) {
    console.warn(
      '[Veritras] Environment validation warnings:\n' +
        warnings.join('\n') +
        '\nPlease check your .env file or hosting environment variables.'
    )
  }
}
