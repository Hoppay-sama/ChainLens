import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, hardhat } from 'wagmi/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (import.meta.env.PROD && !projectId && !import.meta.env.CI) {
  throw new Error(
    '[Veritras] VITE_WALLETCONNECT_PROJECT_ID is required in production. ' +
      'Get a free Project ID at https://cloud.walletconnect.com'
  )
}

const chains = import.meta.env.PROD
  ? ([sepolia] as const)
  : ([sepolia, hardhat] as const)

export const rainbowKitConfig = getDefaultConfig({
  appName: 'Veritras',
  projectId: projectId || 'YOUR_PROJECT_ID',
  chains,
  ssr: false,
})
