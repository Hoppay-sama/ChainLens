# ChainLens Blockchain Layer

Smart contracts and Hardhat tooling for the ChainLens supply chain traceability platform.

## Contracts

- **ProductRegistry.sol** — Registers products with a unique ID, manufacturer, name, and description.
- **ShipmentTracker.sol** — Records shipment checkpoints, status updates, and custody transfers.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your RPC URL, private key, and Etherscan API key
```

## Scripts

| Script   | Command                |
|----------|------------------------|
| Compile  | `npm run compile`      |
| Test     | `npm run test`         |
| Deploy   | `npm run deploy`       |
| Coverage | `npm run coverage`     |

## Deploying to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Deployed addresses are written to `deployed-contracts.json`.
