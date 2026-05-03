# =============================================================================
# ChainLens Sepolia Deployment Script (Windows PowerShell)
# =============================================================================
# This script:
#   1. Loads env vars from blockchain\.env
#   2. Deploys ProductRegistry + ShipmentTracker to Sepolia
#   3. Saves deployment metadata to blockchain\deployed-contracts.json
#   4. Verifies both contracts on Etherscan
#
# Prerequisites:
#   - Node.js >= 20
#   - PowerShell 5.1+ or PowerShell Core
#   - Sepolia ETH in deployer wallet
# =============================================================================

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$BlockchainDir = Join-Path $RepoRoot "blockchain"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ChainLens Sepolia Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. Load .env
# ------------------------------------------------------------------------------
$EnvFile = Join-Path $BlockchainDir ".env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "ERROR: $EnvFile not found. Copy .env.example and fill it in."
    exit 1
}

Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $val, "Process")
    }
}

if ([string]::IsNullOrWhiteSpace($env:SEPOLIA_RPC_URL)) {
    Write-Error "ERROR: SEPOLIA_RPC_URL is not set in blockchain\.env"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:PRIVATE_KEY)) {
    Write-Error "ERROR: PRIVATE_KEY is not set in blockchain\.env"
    exit 1
}

# ------------------------------------------------------------------------------
# 2. Install dependencies (if needed)
# ------------------------------------------------------------------------------
Set-Location $BlockchainDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# ------------------------------------------------------------------------------
# 3. Deploy
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "Deploying contracts to Sepolia..."
npx hardhat run scripts\deploy.ts --network sepolia

# ------------------------------------------------------------------------------
# 4. Parse deployed addresses
# ------------------------------------------------------------------------------
$DeploymentFile = Join-Path $BlockchainDir "deployed-contracts.json"

if (-not (Test-Path $DeploymentFile)) {
    Write-Error "ERROR: Deployment file not found at $DeploymentFile"
    exit 1
}

$Deployment = Get-Content $DeploymentFile | ConvertFrom-Json
$ProductRegistry = $Deployment.contracts.ProductRegistry
$ShipmentTracker = $Deployment.contracts.ShipmentTracker

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "ProductRegistry:  $ProductRegistry"
Write-Host "ShipmentTracker:  $ShipmentTracker"
Write-Host "Metadata saved:   $DeploymentFile"
Write-Host ""

# ------------------------------------------------------------------------------
# 5. Verify on Etherscan (if ETHERSCAN_API_KEY is present)
# ------------------------------------------------------------------------------
if (-not [string]::IsNullOrWhiteSpace($env:ETHERSCAN_API_KEY)) {
    Write-Host "Verifying contracts on Etherscan..."

    Write-Host ""
    Write-Host "-> Verifying ProductRegistry..."
    npx hardhat verify --network sepolia $ProductRegistry

    Write-Host ""
    Write-Host "-> Verifying ShipmentTracker..."
    npx hardhat verify --network sepolia $ShipmentTracker $ProductRegistry

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Verification Complete" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Warning "WARNING: ETHERSCAN_API_KEY not set. Skipping Etherscan verification."
    Write-Host "To verify manually, run:"
    Write-Host "  npx hardhat verify --network sepolia $ProductRegistry"
    Write-Host "  npx hardhat verify --network sepolia $ShipmentTracker $ProductRegistry"
}

Write-Host ""
Write-Host "Done! Update your backend and frontend .env files with the addresses above."
