# ChainLens

> Blockchain-powered supply chain analytics platform

ChainLens provides transparent, end-to-end visibility into supply chain operations by leveraging on-chain provenance data, off-chain indexing, and an interactive analytics dashboard.

---

## Architecture

```
┌─────────────────┐
│    Frontend     │  React + Vite (Port 3000 / 5173)
│   (Next.js?)    │
└────────┬────────┘
         │ HTTP / REST / WebSocket
         ▼
┌─────────────────┐
│     Backend     │  Python + FastAPI (Port 8000)
│  (indexer API)  │
└────────┬────────┘
         │ SQLAlchemy / asyncpg
         ▼
┌─────────────────┐
│   PostgreSQL    │  Postgres 15 (Port 5432)
└─────────────────┘
         ▲
         │ Web3 / JSON-RPC
┌─────────────────┐
│   Blockchain    │  Hardhat / Local EVM
│  (Solidity)     │
└─────────────────┘
```

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Blockchain   | Solidity, Hardhat, Ethers.js      |
| Backend      | Python 3.11, FastAPI, SQLAlchemy  |
| Frontend     | React, TypeScript, Vite           |
| Database     | PostgreSQL 15                     |
| CI/CD        | GitHub Actions                    |
| Deployment   | Docker, Docker Compose            |

---

## Directory Structure

```
ChainLens/
├── .github/workflows/   # CI/CD pipelines
├── blockchain/          # Smart contracts & Hardhat project
├── backend/             # Python API & indexer
├── frontend/            # React web application
├── docker-compose.yml   # Local orchestration
└── README.md
```

---

## Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Blockchain

```bash
cd blockchain
cp .env.example .env
npm install
npx hardhat compile
npx hardhat test
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # .venv\Scripts\activate on Windows
pip install -r requirements.txt
# TODO: add migration and seed commands
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 4. Full Stack (Docker)

```bash
docker compose up --build
```

---

## Deployment

> **TODO**: Add production deployment instructions (e.g., Fly.io, Render, AWS, or GCP).

- Backend container image: `./backend/Dockerfile`
- Frontend container image: `./frontend/Dockerfile`
- Database: managed PostgreSQL (recommended for production)

---

## AI Usage Disclosure

Parts of this project—including scaffolding, configuration, documentation, and certain utility modules—were generated or assisted by AI (large language models) and subsequently reviewed by human developers. All AI-generated code was audited for correctness, security, and adherence to project standards before inclusion.

---

## Live URLs

| Environment | URL                           | Status |
| ----------- | ----------------------------- | ------ |
| Production  | https://chainlens.example.com | TBD    |
| Staging     | https://staging.chainlens.io  | TBD    |

---

## License

[MIT](LICENSE) — unless specified otherwise.
