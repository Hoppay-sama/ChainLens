import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const rainbowKitConfig = getDefaultConfig({
  appName: 'ChainLens',
  projectId,
  chains: [sepolia],
  ssr: false,
})
