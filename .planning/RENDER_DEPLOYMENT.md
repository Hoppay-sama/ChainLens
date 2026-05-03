# ChainLens Deployment Guide — Render + Neon + Vercel

> **Stack:** Render (backend) + Neon (PostgreSQL) + Vercel (frontend)  
> **Cost:** $0/month (within free tiers)  
> **Status:** Free web service sleeps after 15 min (30s cold start on first request)

---

## Prerequisites

| Service | URL | What you need |
|---------|-----|---------------|
| Render account | https://render.com | Free, no credit card |
| Neon account | https://neon.tech | Free PostgreSQL, no credit card |
| Vercel account | https://vercel.com | Free static hosting |
| GitHub repo | https://github.com | Your ChainLens repo pushed |

---

## Phase 1: Neon PostgreSQL Database

You may already have this from the Fly.io attempt.

### If you already have a Neon database:
1. Go to https://console.neon.tech
2. Select your `chainlens` project
3. Click **"Connect"**
4. Copy the connection string
5. Convert to SQLAlchemy format: `postgresql://` → `postgresql+psycopg2://`

### If you need to create one:
1. Go to https://console.neon.tech
2. Click **"New Project"**
3. Project name: `chainlens`
4. Database name: `chainlens`
5. PostgreSQL version: `16`
6. Region: Choose closest to you
7. Click **"Create Project"**
8. Click **"Connect"** → Select **psycopg2**
9. Copy the connection string

**Convert for SQLAlchemy:**
```
# From Neon:
postgresql://user:password@host/chainlens?sslmode=require

# To SQLAlchemy:
postgresql+psycopg2://user:password@host/chainlens?sslmode=require
```

**Save this** — you'll paste it into Render.

---

## Phase 2: Deploy Backend to Render

### Step 1: Connect GitHub Repo
1. Go to https://dashboard.render.com
2. Sign up / Log in (use GitHub for easiest setup)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub account
5. Find and select your `ChainLens` repo
6. Click **"Connect"**

### Step 2: Configure the Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `chainlens-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Branch** | `main` |
| **Dockerfile Path** | `./Dockerfile` |

Click **"Create Web Service"**

### Step 3: Set Environment Variables
While Render is building, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+psycopg2://user:password@host/chainlens?sslmode=require` |
| `SEPOLIA_RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY` |
| `CORS_ORIGINS` | `*` (update after Vercel deploy) |

Click **"Save Changes"**

### Step 4: Wait for Deploy
Render will build from your Dockerfile and deploy. This takes 3-5 minutes.

You'll get a URL like:
```
https://chainlens-api.onrender.com
```

### Step 5: Verify
```bash
curl https://chainlens-api.onrender.com/health
```

Expected response:
```json
{"status":"ok","database":"connected","web3":"connected"}
```

---

## Phase 3: Deploy Frontend to Vercel

### Step 1: Set Environment Variables
In your `frontend/.env.production`:
```env
VITE_API_URL=https://chainlens-api.onrender.com
VITE_PRODUCT_REGISTRY_CONTRACT=0x1F76018532D619194f6628ADc186e3c86FcB5AaA
VITE_SHIPMENT_TRACKER_CONTRACT=0x95b09C0aeD53f6b63C072F4ecaC18861FcbBFB30
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### Step 2: Deploy
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   - `VITE_API_URL` = `https://chainlens-api.onrender.com`
   - `VITE_PRODUCT_REGISTRY_CONTRACT` = `0x1F76018532D619194f6628ADc186e3c86FcB5AaA`
   - `VITE_SHIPMENT_TRACKER_CONTRACT` = `0x95b09C0aeD53f6b63C072F4ecaC18861FcbBFB30`
   - `VITE_WALLETCONNECT_PROJECT_ID` = your project ID
5. Click **Deploy**

### Step 3: Update CORS
After Vercel gives you a domain (e.g., `https://chainlens.vercel.app`):

1. Go to Render Dashboard → your service → **Environment**
2. Change `CORS_ORIGINS` to:
   ```
   https://chainlens.vercel.app,https://chainlens-git-main.vercel.app
   ```
3. Click **Save Changes**
4. Render will auto-redeploy

---

## Free Tier Limits

### Render Free Web Service
- **CPU:** 512 MB RAM
- **Sleep:** After 15 min inactivity (30s cold start)
- **Bandwidth:** 100 GB/month
- **Build minutes:** 500 min/month
- **Status:** ✅ Sufficient for portfolio

### Neon Free Tier
- **Storage:** 500 MB
- **Compute:** 190 hours/month
- **Branches:** 10
- **Status:** ✅ Sufficient for portfolio

### Vercel Free Tier
- **Bandwidth:** 100 GB/month
- **Build minutes:** 6000 min/month
- **Status:** ✅ Sufficient for static site

---

## Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   Vercel        │ ◄────────────► │   Render        │
│  (Frontend)     │                │  (Backend)      │
│                 │                │  FastAPI        │
└─────────────────┘                │  Docker         │
                                   │                 │
                                   │  Sleeps after   │
                                   │  15 min idle    │
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

## Troubleshooting

### "Service Unavailable" or 502 Error
- Render free tier is sleeping. Wait 30 seconds and refresh.
- Or visit the backend URL directly first to wake it up.

### CORS errors in browser
- Update `CORS_ORIGINS` in Render with your exact Vercel domain
- Include both production and preview domains

### Database connection fails
- Check `DATABASE_URL` format: must use `postgresql+psycopg2://`
- Ensure `?sslmode=require` is included
- Verify Neon database is active

### Build fails on Render
- Check Render logs for errors
- Ensure `backend/Dockerfile` exists and is valid
- Verify `requirements.txt` has all dependencies

---

## Keeping Render Awake (Optional)

If you want to prevent the 15-min sleep (e.g., for a demo), use a free uptime monitor:

1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://chainlens-api.onrender.com/health`
   - Interval: 5 minutes
4. This pings your backend every 5 min, keeping it awake

**Note:** This is against Render's terms for sustained traffic, but fine for occasional portfolio demos.

---

*Last updated: 2026-05-03*
