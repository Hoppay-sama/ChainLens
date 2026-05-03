# ChainLens Deployment Runbook

> **Target audience:** Technical team member deploying ChainLens to production for the first time.  
> **Estimated time:** 45–90 minutes (mostly waiting for network confirmations).  
> **Last updated:** 2026-05-02

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Blockchain Deployment](#phase-1-blockchain-deployment)
3. [Phase 2: Backend Deployment](#phase-2-backend-deployment)
4. [Phase 3: Frontend Deployment](#phase-3-frontend-deployment)
5. [Phase 4: Post-Deployment Verification](#phase-4-post-deployment-verification)
6. [Phase 5: Maintenance & Troubleshooting](#phase-5-maintenance--troubleshooting)

---

## Prerequisites

### Required Accounts

| Service | Why you need it |
|---------|-----------------|
| **GitHub** | Host the repo; Railway / Vercel deploy from GitHub. |
| **Alchemy** or **Infura** | Sepolia RPC endpoint (free tier is fine). |
| **MetaMask** | Wallet with Sepolia ETH for contract deployment. |
| **WalletConnect Cloud** | `VITE_WALLETCONNECT_PROJECT_ID` for frontend Web3Modal. |
| **Railway** (recommended) or **Render** | Host the Python/FastAPI backend + PostgreSQL. |
| **Vercel** | Host the React/Vite frontend. |
| **Etherscan** (optional but recommended) | Verify deployed contracts so users can read source code. |

### Required Tools

Install these locally **before** you start:

| Tool | Version | Install link |
|------|---------|--------------|
| Node.js | `>= 20.x` | <https://nodejs.org/> |
| Python | `>= 3.11` | <https://python.org/> |
| Git | latest | <https://git-scm.com/> |

Verify versions:

```bash
node -v   # should print v20.x.x
python --version  # should print 3.11.x
git --version
```

### Get Sepolia ETH

You need a small amount of Sepolia ETH to deploy the two contracts (expected ~0.001–0.002 ETH total).

1. Switch MetaMask to the **Sepolia Test Network**.
2. Copy your wallet address.
3. Request funds from a faucet:
   - <https://sepoliafaucet.com/> (Alchemy — 0.5 Sepolia ETH/day)
   - <https://www.infura.io/faucet/sepolia> (Infura — 0.5 Sepolia ETH/day)
   - <https://faucet.quicknode.com/ethereum/sepolia> (QuickNode)

> **Tip:** If you run out, ask in the Alchemy Discord — they’re generous with test ETH.

---

## Phase 1: Blockchain Deployment

### 1.1 Configure environment variables

```bash
# From repo root
cd blockchain
cp .env.example .env
```

Edit `.env` and fill in real values (never commit this file):

```dotenv
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=0xYOUR_METAMASK_PRIVATE_KEY_NO_0x_PREFIX
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

> **Security warning:** `PRIVATE_KEY` grants full control of the deployer wallet. Treat it like a password. Do **not** commit it.

### 1.2 Install dependencies

```bash
npm install
```

### 1.3 Deploy to Sepolia

We provide two ways to run the deployment:

#### Option A — One-shot script (recommended)

```bash
# From repo root — works on macOS / Linux / WSL
./scripts/deploy-sepolia.sh

# On Windows PowerShell (if you prefer not to use WSL):
.\scripts\deploy-sepolia.ps1
```

#### Option B — Manual commands

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network sepolia
```

You will see output like:

```text
Deploying contracts with the account: 0xYourDeployerAddress...
ProductRegistry deployed to: 0xAbC...123
ShipmentTracker deployed to: 0xDeF...456
Deployment info saved to: .../blockchain/deployed-contracts.json
```

### 1.4 Copy contract artifacts to backend & frontend

```bash
# From repo root
mkdir -p backend/app/contracts
mkdir -p frontend/src/contracts

# Copy ABIs
cp blockchain/artifacts/contracts/ProductRegistry.sol/ProductRegistry.json backend/app/contracts/
cp blockchain/artifacts/contracts/ShipmentTracker.sol/ShipmentTracker.json backend/app/contracts/
cp blockchain/artifacts/contracts/ProductRegistry.sol/ProductRegistry.json frontend/src/contracts/
cp blockchain/artifacts/contracts/ShipmentTracker.sol/ShipmentTracker.json frontend/src/contracts/
```

> **Note:** If your backend/frontend code imports ABIs from a different path, adjust the `cp` destinations accordingly.

### 1.5 Verify contracts on Etherscan

Verification lets anyone read the Solidity source on Etherscan. It is **strongly recommended** for production.

```bash
cd blockchain

# ProductRegistry (no constructor args)
npx hardhat verify --network sepolia 0xYOUR_PRODUCT_REGISTRY_ADDRESS

# ShipmentTracker (constructor requires ProductRegistry address)
npx hardhat verify --network sepolia 0xYOUR_SHIPMENT_TRACKER_ADDRESS 0xYOUR_PRODUCT_REGISTRY_ADDRESS
```

If the one-shot script ran successfully, verification is already done automatically.

### 1.6 Expected gas costs & timing

| Contract | Estimated Gas | Sepolia Confirm Time |
|----------|--------------|----------------------|
| `ProductRegistry` | ~600k–900k | 15–60 seconds |
| `ShipmentTracker` | ~700k–1.1M | 15–60 seconds |

Total cost at 10 gwei ≈ **0.0013–0.0020 ETH**.

---

## Phase 2: Backend Deployment

### 2.1 Push code to GitHub

Make sure the repo (with copied ABIs) is pushed to a **private** GitHub repository:

```bash
git add .
git commit -m "chore: add deployed contract ABIs and addresses"
git push origin main
```

### 2.2 Option A — Railway (recommended)

Railway offers the smoothest experience for this stack: GitHub-native deploys, managed PostgreSQL, and automatic HTTPS.

#### Step 1: Create project

1. Go to <https://railway.app/> and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `ChainLens` repo.
4. Railway detects the `backend/Dockerfile` automatically and builds with Docker.

#### Step 2: Add PostgreSQL

1. Inside the project, click **New** → **Database** → **Add PostgreSQL**.
2. Railway creates the DB and injects a `DATABASE_URL` environment variable automatically.
3. **Delete** the auto-generated `DATABASE_URL` from the service variables (we will add our own so we control the format).

#### Step 3: Configure environment variables

In the Railway dashboard, open your **backend** service → **Variables** tab. Add the following:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `DATABASE_URL` | `postgresql+psycopg2://postgres:password@containers.railway.app:5432/railway` | SQLAlchemy-compatible Postgres DSN. Copy the internal connection string from the PostgreSQL service and prepend `postgresql+psycopg2://`. |
| `SEPOLIA_RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/...` | Same Alchemy/Infura URL used for deployment. |
| `PRODUCT_REGISTRY_CONTRACT` | `0xAbC...123` | Address from Phase 1. |
| `SHIPMENT_TRACKER_CONTRACT` | `0xDeF...456` | Address from Phase 1. |
| `API_HOST` | `0.0.0.0` | Bind to all interfaces inside the container. |
| `API_PORT` | `8000` | Port exposed by the Dockerfile. |
| `INDEXER_POLL_INTERVAL` | `60` | Seconds between blockchain indexer polls. Use `60` in production to respect RPC rate limits. |
| `INDEXER_START_BLOCK` | `6123456` | Block number where contracts were deployed. Prevents indexer from scanning from block 0 on Sepolia. |
| `CORS_ORIGINS` | `https://your-app.vercel.app,https://your-app-git-main.vercel.app` | Comma-separated list of allowed frontend domains. Required for browser requests. |

> **Railway tip:** Railway automatically exposes `PORT` and generates a public domain (`https://your-app.up.railway.app`). You do **not** need to set `API_PORT` or `API_HOST` unless you want to override defaults.

#### Step 4: Deploy

1. Click **Deploy** (or push to `main` — Railway auto-deploys).
2. Watch the **Deployments** tab for build logs.
3. Once the build finishes, Railway runs the container with `gunicorn` as configured in `backend/gunicorn.conf.py`.

#### Step 5: Seed demo data (optional)

If you have a seed script:

```bash
# From your local machine, pointed at the deployed backend
curl -X POST https://your-backend.up.railway.app/seed
```

> If the project does **not** include a seed endpoint, skip this step. SQLAlchemy auto-creates tables on first startup via `Base.metadata.create_all(bind=engine)` in `app/main.py`.

#### Step 6: Configure indexer start block (important)

The indexer should begin scanning from the block where contracts were deployed, not block 0.  
Set the `INDEXER_START_BLOCK` environment variable in Railway to the deployment block number.

```bash
# Find deployment block from the deploy transaction hash
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xYOUR_DEPLOY_TX_HASH"],"id":1}'
```

Extract `blockNumber`, convert from hex to decimal, and set as `INDEXER_START_BLOCK`. The indexer will start from this block on its first run (subsequent runs resume from `indexer_state.json`).

### 2.3 Option B — Render

If you prefer Render over Railway:

1. Go to <https://render.com/> → **New Web Service**.
2. Connect your GitHub repo.
3. **Runtime:** Docker.
4. **Root Directory:** `backend`.
5. Add a **PostgreSQL** managed database under **Databases**.
6. Copy the internal connection string and set `DATABASE_URL` in **Environment** → add `postgresql+psycopg2://` prefix.
7. Add the same contract / RPC variables listed in the Railway table above.
8. Click **Create Web Service**.

Render will build from `backend/Dockerfile` and expose the service on a `onrender.com` domain.

---

## Phase 3: Frontend Deployment

### 3.1 Configure environment variables

```bash
cd frontend
cp .env.production.example .env.production
```

Fill in real values:

```dotenv
VITE_API_URL=https://your-backend.up.railway.app
VITE_PRODUCT_REGISTRY_CONTRACT=0xYOUR_PRODUCT_REGISTRY_CONTRACT_ADDRESS
VITE_SHIPMENT_TRACKER_CONTRACT=0xYOUR_SHIPMENT_TRACKER_CONTRACT_ADDRESS
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

> **Note:** `VITE_` prefix is required for Vite to expose the variable to the client-side bundle.

### 3.2 Push to GitHub

```bash
git add .
git commit -m "chore: add frontend production env"
git push origin main
```

### 3.3 Import into Vercel

1. Go to <https://vercel.com/> → **Add New Project**.
2. Import your GitHub repository.
3. Vercel auto-detects **Vite** as the framework. Confirm these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. Add **Environment Variables** in the Vercel UI (or they will be pulled from `.env.production` if committed — **do not commit secrets**):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.up.railway.app` |
| `VITE_PRODUCT_REGISTRY_CONTRACT` | `0x...` |
| `VITE_SHIPMENT_TRACKER_CONTRACT` | `0x...` |
| `VITE_WALLETCONNECT_PROJECT_ID` | `your_project_id` |

5. Click **Deploy**.

Vercel builds the project and provides a `*.vercel.app` domain.

### 3.4 Custom domain (optional)

1. In the Vercel project, go to **Domains**.
2. Enter your domain (e.g., `app.chainlens.io`).
3. Follow DNS instructions (usually a CNAME record to `cname.vercel-dns.com`).
4. Vercel provisions an SSL certificate automatically.

### 3.5 SPA routing fallback

The repo already contains `frontend/vercel.json` which rewrites all routes to `index.html` and adds security headers. No additional configuration is needed.

---

## Phase 4: Post-Deployment Verification

Run through this checklist in order.

### 4.1 Backend health check

```bash
curl https://your-backend.up.railway.app/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "web3": "connected"
}
```

If `web3` is `disconnected`, check `SEPOLIA_RPC_URL`.

### 4.2 API test — list products

```bash
curl https://your-backend.up.railway.app/products
```

Expected:

```json
[]
```

(or existing seeded products).

### 4.3 Frontend load test

1. Open the Vercel URL in your browser.
2. Click **Connect Wallet**.
3. Ensure MetaMask (or WalletConnect) pops up.
4. Switch network to **Sepolia**.
5. The wallet address should appear in the UI header.

### 4.4 End-to-end flow

1. **Register a product**
   - Frontend → "Register Product" → fill form → submit.
   - Approve the MetaMask transaction.
   - Wait for Sepolia confirmation (~15–60s).
2. **Create a shipment**
   - Select the product → "Create Shipment" → submit.
   - Approve transaction.
3. **Add a checkpoint**
   - Go to shipment details → "Add Checkpoint" → submit.
4. **Verify on dashboard**
   - Refresh the page.
   - The product, shipment, and checkpoints should appear.
   - Check the backend indexer logs if data is missing (indexer polls every `INDEXER_POLL_INTERVAL` seconds).

> **Troubleshooting:** If the transaction succeeds but the UI does not update, open the browser DevTools → Network tab and confirm the backend returned `200 OK` on the API calls.

---

## Phase 5: Maintenance & Troubleshooting

### 5.1 Redeploying contracts

If you need to deploy new contract versions:

1. **Deploy new contracts** (Phase 1).
2. **Update backend env vars** in Railway / Render with the new addresses.
3. **Update frontend env vars** in Vercel with the new addresses.
4. **Redeploy backend & frontend** (Railway/Vercel redeploy automatically on env change if you click redeploy; otherwise push an empty commit).
5. **Reset indexer** — if your indexer stores a "last scanned block", reset it to the new deployment block so it picks up events from the new contracts.

### 5.2 Restarting the indexer

The indexer runs inside the same FastAPI process (background thread / asyncio task). To restart it:

- **Railway:** Click **Redeploy** on the backend service.
- **Render:** Click **Manual Deploy** → **Clear build cache & deploy**.
- **Local Docker:** `docker compose restart backend`

If you need to clear indexed data and start over:

```bash
# Connect to your Railway Postgres (via Railway CLI or GUI)
TRUNCATE TABLE products, shipments, checkpoints RESTART IDENTITY;
```

Then restart the backend.

### 5.3 Checking logs

| Platform | Where to look |
|----------|---------------|
| **Railway** | Service → **Deployments** tab → click the active deployment → **Logs**. |
| **Render** | Service → **Logs** tab (live tail). |
| **Vercel** | Project → **Deployments** → click latest → **Function Logs** (for SSR/Edge) or **Build Logs**. |

### 5.4 Common issues & fixes

#### CORS errors in browser

**Symptom:** Browser console shows `Access-Control-Allow-Origin` errors when calling the backend.

**Fix:**
- Add your Vercel domain to `allow_origins` in `backend/app/main.py`:

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend.vercel.app",   # <-- add this
    "https://app.chainlens.io",           # <-- and custom domain if applicable
]
```

- Commit, push, and redeploy the backend.

#### RPC rate limits (429 errors)

**Symptom:** Backend logs show `429 Too Many Requests` from Alchemy/Infura.

**Fix:**
- Increase `INDEXER_POLL_INTERVAL` to `60` or `120` seconds.
- Upgrade to a paid Alchemy/Infura tier for higher rate limits.
- Add a backup RPC URL and round-robin between them (requires code change).

#### Contract address mismatch

**Symptom:** Transactions succeed but nothing shows in the dashboard; or frontend shows "contract not found".

**Fix:**
- Double-check that `PRODUCT_REGISTRY_CONTRACT` and `SHIPMENT_TRACKER_CONTRACT` in Railway match the addresses in Vercel.
- Ensure the backend and frontend ABIs match the deployed contract versions.
- Verify you are on the **Sepolia** network in MetaMask.

#### Database connection errors

**Symptom:** `/health` returns `database: disconnected`.

**Fix:**
- Check `DATABASE_URL` format: must start with `postgresql+psycopg2://`.
- Ensure the Postgres service is running (Railway: check the DB service status).
- Verify the password does not contain special characters that need URL-encoding (e.g., `#`, `@`, `:`).

#### Frontend shows blank page after deploy

**Symptom:** Vercel deployment succeeds but visiting the URL shows a white screen.

**Fix:**
- Open DevTools → Console. Look for missing `VITE_` variable errors.
- Ensure all `VITE_*` env vars are set in the Vercel dashboard **before** the build.
- Re-deploy with "Use Existing Build Cache" **disabled** if you added env vars after the first build.

---

## Quick Reference: File Locations

| File | Purpose |
|------|---------|
| `blockchain/deployed-contracts.json` | Auto-generated deployment manifest with addresses. |
| `backend/railway.toml` | Railway deployment configuration. |
| `frontend/vercel.json` | SPA fallback + security headers for Vercel. |
| `backend/.env.production.example` | Template for backend production env vars. |
| `frontend/.env.production.example` | Template for frontend production env vars. |
| `scripts/deploy-sepolia.sh` | One-shot deploy + verify for macOS/Linux/WSL. |
| `scripts/deploy-sepolia.ps1` | One-shot deploy + verify for Windows PowerShell. |

---

## Support

- **Railway docs:** <https://docs.railway.app/>
- **Vercel docs:** <https://vercel.com/docs>
- **Hardhat verify:** <https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify>
- **Sepolia Etherscan:** <https://sepolia.etherscan.io/>
