const { ethers } = require("hardhat");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

// Configuration for Avalanche Fuji
const FUJI_CONFIG = {
  chainId: 43113,
  ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  avalancheChainSelector: 14767482510784806043,
  aksTokenAddress: "0x6f5db1c1b50acdf4edd4a19d03652dd0ed9530af",
  aksBridgeAddress: "0x0b1eb42b21156aad19406ed0499ccad92414050c",
  subscriptionId: process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID,
  functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"
};

async function main() {
  const [deployer, landAuthority] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Compliance Module
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy();
  await compliance.deployed();
  console.log("Compliance module deployed to:", compliance.getAddress());

  // Deploy Insurance Payouts
  const PayoutManager = await ethers.getContractFactory("InsurancePayout");
  const payoutManager = await PayoutManager.deploy(FUJI_CONFIG.aksTokenAddress);
  await payoutManager.deployed();
  console.log("Token Manager deployed to:", payoutManager.getAddress());

  // Deploy InsuranceFund
  const InsuranceFund = await ethers.getContractFactory("InsuranceFund");
  const payoutManagerAddress = await payoutManager.getAddress();
  const insuranceFund = await InsuranceFund.deploy(
    FUJI_CONFIG.functionsRouter,
    payoutManagerAddress,
    FUJI_CONFIG.aksTokenAddress,
    FUJI_CONFIG.subscriptionId,
    300000, // Gas limit
    ethers.utils.formatBytes32String("fun-avalanche-fuji-1")
  );
  await insuranceFund.deployed();
  console.log("InsuranceFund deployed to:", insuranceFund.getAddress());

  // Deploy FarmToken (ERC1155 with CCIP)
  const FarmToken = await ethers.getContractFactory("FarmToken");
  complianceAddress = await compliance.getAddress();
  const farmToken = await FarmToken.deploy(
    deployer.address, // initialOwner
    landAuthority.address, // landRegistryAuthority
    complianceAddress, // compliance
    FUJI_CONFIG.aksTokenAddress, // aksStablecoin
    FUJI_CONFIG.aksBridgeAddress, // aksBridge
    FUJI_CONFIG.ccipRouter, // ccipRouter
    FUJI_CONFIG.chainId // currentChainId
  );
  await farmToken.deployed();

  const farmTokenAddress = await farmToken.getAddress();
  console.log("FarmToken deployed to:", farmTokenAddress);
  const deploymentTsx = farmToken.deploymentTransaction();
  const txReceipt = await deploymentTsx.wait();

  // Configure contracts
  console.log("Configuring contracts...");

  // Grant minter role to FarmToken in AKS contract
  //await aks.grantRole(await aks.MINTER_ROLE(), farmTokenAddress);

  // Add FarmToken as trusted sender in compliance
  await compliance.addTrustedContract(farmTokenAddress);

  // Save deployment info
  const deploymentReserveInfo = {
    contractName: "FarmToken",
    contractAddress: farmTokenAddress,
    deployer: deployer.address,
    transaction: {
      hash: deploymentTsx.hash,
      blockNumber: txReceipt.blockNumber,
      gasUsed: txReceipt.gasUsed.toString(),
      gasPrice: txReceipt.gasPrice.toString(),
      deploymentCost: ethers.formatEther(
        txReceipt.gasUsed * txReceipt.gasPrice
      ),
    },
    timestamp: new Date().toISOString(),
  };

  // Define directory paths
  const deploymentsDir = path.resolve(__dirname, "..", "deployments");
  const networkDir = path.join(deploymentsDir, network.name);

  // Ensure directories exist
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.mkdirSync(networkDir, { recursive: true });

  // Save files
  fs.writeFileSync(
    path.join(networkDir, "FarmToken.json"),
    JSON.stringify(deploymentReserveInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
