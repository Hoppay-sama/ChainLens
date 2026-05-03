#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# ChainLens Sepolia Deployment Script (macOS / Linux / WSL)
# =============================================================================
# This script:
#   1. Loads env vars from blockchain/.env
#   2. Deploys ProductRegistry + ShipmentTracker to Sepolia
#   3. Saves deployment metadata to blockchain/deployed-contracts.json
#   4. Verifies both contracts on Etherscan
#
# Prerequisites:
#   - Node.js >= 20
#   - jq OR node (for JSON parsing)
#   - Sepolia ETH in deployer wallet
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BLOCKCHAIN_DIR="${REPO_ROOT}/blockchain"

echo "========================================"
echo "ChainLens Sepolia Deployment"
echo "========================================"

# ------------------------------------------------------------------------------
# 1. Load .env
# ------------------------------------------------------------------------------
if [ ! -f "${BLOCKCHAIN_DIR}/.env" ]; then
  echo "ERROR: ${BLOCKCHAIN_DIR}/.env not found. Copy .env.example and fill it in."
  exit 1
fi

# Export variables from .env (ignore comments and empty lines)
set -a
source "${BLOCKCHAIN_DIR}/.env"
set +a

# Validate required vars
if [ -z "${SEPOLIA_RPC_URL:-}" ]; then
  echo "ERROR: SEPOLIA_RPC_URL is not set in blockchain/.env"
  exit 1
fi

if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "ERROR: PRIVATE_KEY is not set in blockchain/.env"
  exit 1
fi

# ------------------------------------------------------------------------------
# 2. Install dependencies (if needed)
# ------------------------------------------------------------------------------
cd "${BLOCKCHAIN_DIR}"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# ------------------------------------------------------------------------------
# 3. Deploy
# ------------------------------------------------------------------------------
echo ""
echo "Deploying contracts to Sepolia..."
npx hardhat run scripts/deploy.ts --network sepolia

# ------------------------------------------------------------------------------
# 4. Parse deployed addresses
# ------------------------------------------------------------------------------
DEPLOYMENT_FILE="${BLOCKCHAIN_DIR}/deployed-contracts.json"

if [ ! -f "${DEPLOYMENT_FILE}" ]; then
  echo "ERROR: Deployment file not found at ${DEPLOYMENT_FILE}"
  exit 1
fi

# Try jq first, fallback to Node.js
if command -v jq &> /dev/null; then
  PRODUCT_REGISTRY=$(jq -r '.contracts.ProductRegistry' "${DEPLOYMENT_FILE}")
  SHIPMENT_TRACKER=$(jq -r '.contracts.ShipmentTracker' "${DEPLOYMENT_FILE}")
else
  PRODUCT_REGISTRY=$(node -e "console.log(require('${DEPLOYMENT_FILE}').contracts.ProductRegistry)")
  SHIPMENT_TRACKER=$(node -e "console.log(require('${DEPLOYMENT_FILE}').contracts.ShipmentTracker)")
fi

echo ""
echo "========================================"
echo "Deployment Complete"
echo "========================================"
echo "ProductRegistry:  ${PRODUCT_REGISTRY}"
echo "ShipmentTracker:  ${SHIPMENT_TRACKER}"
echo "Metadata saved:   ${DEPLOYMENT_FILE}"
echo ""

# ------------------------------------------------------------------------------
# 5. Verify on Etherscan (if ETHERSCAN_API_KEY is present)
# ------------------------------------------------------------------------------
if [ -n "${ETHERSCAN_API_KEY:-}" ]; then
  echo "Verifying contracts on Etherscan..."

  echo ""
  echo "-> Verifying ProductRegistry..."
  npx hardhat verify --network sepolia "${PRODUCT_REGISTRY}"

  echo ""
  echo "-> Verifying ShipmentTracker..."
  npx hardhat verify --network sepolia "${SHIPMENT_TRACKER}" "${PRODUCT_REGISTRY}"

  echo ""
  echo "========================================"
  echo "Verification Complete"
  echo "========================================"
else
  echo "WARNING: ETHERSCAN_API_KEY not set. Skipping Etherscan verification."
  echo "To verify manually, run:"
  echo "  npx hardhat verify --network sepolia ${PRODUCT_REGISTRY}"
  echo "  npx hardhat verify --network sepolia ${SHIPMENT_TRACKER} ${PRODUCT_REGISTRY}"
fi

echo ""
echo "Done! Update your backend and frontend .env files with the addresses above."
