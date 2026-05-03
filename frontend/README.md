# Veritras Frontend

A React 18 + TypeScript dashboard for supply chain traceability. Connects to MetaMask via RainbowKit and visualizes blockchain-verified product data.

## Features

- **Wallet Connection**: MetaMask via RainbowKit (Sepolia testnet)
- **Dashboard**: KPI cards, activity feed, shipment volume charts
- **Product Lookup**: Search by ID, view blockchain history & custody transfers
- **Analytics**: Recharts visualizations, anomaly detection, exportable reports
- **Verify**: QR/product ID verification with blockchain proof

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- RainbowKit + Wagmi + Viem (Web3)
- TanStack Query (data fetching)
- Recharts (charts)
- Lucide React (icons)
- React Router DOM (routing)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API URL and WalletConnect Project ID

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

### Docker

```bash
# Build image
docker build -t veritras-frontend .

# Run container
docker run -p 80:80 veritras-frontend
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_PRODUCT_REGISTRY_CONTRACT` | Product registry contract address |
| `VITE_SHIPMENT_TRACKER_CONTRACT` | Shipment tracker contract address |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
  components/
    Layout.tsx          # Main app shell with nav
    ui/
      Card.tsx          # Reusable card component
      Button.tsx        # Button variants
      Badge.tsx         # Status badges
      LoadingSpinner.tsx # Loading indicator
  pages/
    Dashboard.tsx       # Overview with KPIs & charts
    Products.tsx        # Product search & timeline
    Analytics.tsx       # Charts & anomaly tables
    Verify.tsx          # Product verification
  hooks/
    useApi.ts           # React Query API hooks
  types/
    index.ts            # TypeScript interfaces
  utils/
    cn.ts               # Tailwind class merging
    formatters.ts       # Address/date formatting
  config/
    wagmi.ts            # RainbowKit/Wagmi config
```

## Production Deployment

### Required Environment Variables

Before building for production, ensure the following variables are set in your hosting platform (do not commit `.env` files with real secrets):

| Variable | Description | How to obtain |
|----------|-------------|---------------|
| `VITE_API_URL` | Backend API base URL | Your deployed API endpoint |
| `VITE_PRODUCT_REGISTRY_CONTRACT` | Product registry contract address | Deployed contract on Sepolia |
| `VITE_SHIPMENT_TRACKER_CONTRACT` | Shipment tracker contract address | Deployed contract on Sepolia |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID | https://cloud.walletconnect.com |

### Build Command

```bash
npm run build
```

This runs `tsc && vite build` and outputs the production bundle to the `dist/` folder.

### Vercel Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set the **Framework Preset** to `Vite`.
4. Add the environment variables listed above in **Project Settings > Environment Variables**.
5. Ensure the `vercel.json` at the project root is included in your repository (it handles SPA routing and security headers).
6. Deploy!

> **Note:** The frontend is configured to only allow the **Sepolia** network in production. WalletConnect will not function without a valid `VITE_WALLETCONNECT_PROJECT_ID`.

## Design System

- **Background**: `#0d0d0d`
- **Surface**: `#161616`
- **Accent**: `#c8f060` (lime green)
- **Text**: `#f0ece4`
- **Muted**: `#888888`
- **Fonts**: Instrument Sans (body), DM Mono (data), DM Serif Display (headings)

## License

MIT
