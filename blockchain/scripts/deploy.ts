import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", productRegistryAddress);

  const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
  const shipmentTracker = await ShipmentTracker.deploy(productRegistryAddress);
  await shipmentTracker.waitForDeployment();
  const shipmentTrackerAddress = await shipmentTracker.getAddress();
  console.log("ShipmentTracker deployed to:", shipmentTrackerAddress);

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      ProductRegistry: productRegistryAddress,
      ShipmentTracker: shipmentTrackerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployed-contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
