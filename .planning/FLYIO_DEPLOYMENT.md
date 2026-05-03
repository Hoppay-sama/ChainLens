# ChainLens Deployment Guide — Fly.io + Neon + Vercel

> **Stack:** Fly.io (backend) + Neon (PostgreSQL) + Vercel (frontend)  
> **Cost:** $0/month (within free tiers)  
> **Status:** Never sleeps, always available

---

## Prerequisites

| Service | URL | What you need |
|---------|-----|---------------|
| Fly.io account | https://fly.io | Credit card (won't charge within free tier) |
| Neon account | https://neon.tech | Free PostgreSQL database |
| Vercel account | https://vercel.com | Free static hosting |
| GitHub repo | https://github.com | Your ChainLens repo pushed |

Install Fly CLI:
```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

---

## Phase 1: Neon PostgreSQL Database

### Step 1: Create Neon Project
1. Go to https://console.neon.tech and sign up
2. Click **"New Project"**
3. Project name: `chainlens`
4. Database name: `chainlens`
5. Region: Choose closest to your users (e.g., `US East`)
6. Click **"Create Project"**

### Step 2: Get Connection String
1. In your Neon dashboard, click the **"Connect"** button
2. Select **"psycopg2"** as the driver
3. Copy the connection string
4. It looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/chainlens?sslmode=require
   ```

### Step 3: Update for SQLAlchemy
Neon uses `postgresql://` but SQLAlchemy needs `postgresql+psycopg2://`:
```
postgresql+psycopg2://user:password@ep-xxx.us-east-1.aws.neon.tech/chainlens?sslmode=require
```

**Save this** — you'll need it for the `DATABASE_URL` secret in Fly.io.

---

## Phase 2: Deploy Backend to Fly.io

### Step 1: Login to Fly.io
```bash
fly auth login
```

### Step 2: Launch Your App
From the repo root:
```bash
cd backend
fly launch
```

Fly will detect your `Dockerfile` and `fly.toml`. When prompted:
- **App name:** `chainlens-api` (or your preferred name)
- **Region:** Choose same region as Neon (e.g., `iad` for US East)
- **PostgreSQL:** Skip (we're using Neon)
- **Redis:** Skip
- **Deploy now:** No (we need to set secrets first)

### Step 3: Set Secrets
```bash
# Database (from Neon)
fly secrets set DATABASE_URL="postgresql+psycopg2://user:password@ep-xxx.us-east-1.aws.neon.tech/chainlens?sslmode=require"

# Blockchain RPC (same Alchemy URL from blockchain/.env)
fly secrets set SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

# Contract addresses
fly secrets set PRODUCT_REGISTRY_CONTRACT="0x1F76018532D619194f6628ADc186e3c86FcB5AaA"
fly secrets set SHIPMENT_TRACKER_CONTRACT="0x95b09C0aeD53f6b63C072F4ecaC18861FcbBFB30"

# CORS (update after Vercel deploy)
fly secrets set CORS_ORIGINS="https://your-app.vercel.app"

# Optional: update these in fly.toml instead of secrets if you prefer
fly secrets set INDEXER_START_BLOCK="10779035"
fly secrets set INDEXER_POLL_INTERVAL="60"
```

### Step 4: Deploy
```bash
fly deploy
```

### Step 5: Verify Deployment
```bash
# Check app status
fly status

# Check logs
fly logs

# Test health endpoint
curl https://chainlens-api.fly.dev/health
```

You should see:
```json
{"status":"ok","database":"connected","web3":"connected"}
```

### Step 6: Get Your Backend URL
Your app will be at:
```
https://chainlens-api.fly.dev
```
(Replace `chainlens-api` with your actual app name)

---

## Phase 3: Deploy Frontend to Vercel

### Step 1: Set Environment Variables
In your `frontend/.env.production` file:
```env
VITE_API_URL=https://chainlens-api.fly.dev
VITE_PRODUCT_REGISTRY_CONTRACT=0x1F76018532D619194f6628ADc186e3c86FcB5AaA
VITE_SHIPMENT_TRACKER_CONTRACT=0x95b09C0aeD53f6b63C072F4ecaC18861FcbBFB30
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI
```bash
cd frontend
npm i -g vercel
vercel --prod
```

#### Option B: GitHub Integration (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables in Vercel dashboard:
   - `VITE_API_URL` = `https://chainlens-api.fly.dev`
   - `VITE_PRODUCT_REGISTRY_CONTRACT` = `0x1F76018532D619194f6628ADc186e3c86FcB5AaA`
   - `VITE_SHIPMENT_TRACKER_CONTRACT` = `0x95b09C0aeD53f6b63C072F4ecaC18861FcbBFB30`
   - `VITE_WALLETCONNECT_PROJECT_ID` = your project ID
5. Click **Deploy**

### Step 3: Update CORS
After Vercel gives you a domain (e.g., `https://chainlens.vercel.app`), update Fly.io CORS:
```bash
fly secrets set CORS_ORIGINS="https://chainlens.vercel.app,https://chainlens-git-main.vercel.app"
fly deploy
```

---

## Phase 4: Post-Deployment Verification

### Test the API
```bash
# Health check
curl https://chainlens-api.fly.dev/health

# Products endpoint
curl https://chainlens-api.fly.dev/products

# Analytics
curl https://chainlens-api.fly.dev/analytics/kpi
```

### Test the Frontend
1. Open your Vercel URL
2. Connect wallet (MetaMask on Sepolia)
3. Verify contract addresses are correct in browser console
4. Register a test product
5. Create a shipment
6. Add checkpoints
7. Check dashboard analytics

---

## Free Tier Limits (Important!)

### Fly.io Free Tier
- **Machines:** 3 shared-cpu-1x VMs (we use 1)
- **Bandwidth:** 160GB outbound/month
- **Storage:** 3GB
- **Status:** ✅ Our app fits easily

### Neon Free Tier
- **Storage:** 500MB
- **Compute:** 190 compute hours/month
- **Branches:** 10
- **Status:** ✅ Sufficient for portfolio/demo

### Vercel Free Tier
- **Bandwidth:** 100GB/month
- **Builds:** 6000 minutes/month
- **Status:** ✅ Sufficient for static site

---

## Maintenance Commands

```bash
# View logs
fly logs

# Restart app
fly deploy

# Scale up (if needed)
fly scale count 2

# SSH into machine
fly ssh console

# Update secrets
fly secrets set KEY=value

# View app info
fly status
fly info
```

---

## Troubleshooting

### Database connection fails
- Check `DATABASE_URL` format: must use `postgresql+psycopg2://`
- Ensure `?sslmode=require` is included for Neon
- Verify Neon database is active (not suspended)

### CORS errors in browser
- Update `CORS_ORIGINS` secret with exact Vercel domain
- Include both production and preview domains
- Redeploy after changing CORS

### Indexer not starting
- Check `SEPOLIA_RPC_URL` is valid
- Verify contract addresses are correct
- Check `INDEXER_START_BLOCK` is set
- View logs: `fly logs`

### Out of memory
- Upgrade VM: `fly scale vm shared-cpu-2x`
- Or reduce gunicorn workers in `gunicorn.conf.py`

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   Vercel        │ ◄────────────► │   Fly.io        │
│  (Frontend)     │                │  (Backend)      │
│                 │                │  FastAPI        │
└─────────────────┘                │  Docker         │
                                   │                 │
                                   │  Web3.py        │
                                   │  Indexer        │
                                   └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │   Neon          │
                                   │  (PostgreSQL)   │
                                   └─────────────────┘
                                            │
                                   ┌────────▼────────┐
                                   │   Alchemy       │
                                   │  (Sepolia RPC)  │
                                   └─────────────────┘
```

---

*Last updated: 2026-05-03*  
*For help: https://fly.io/docs/ or https://community.fly.io*
