const { ethers } = require("hardhat");
const fs = require("fs");

// Configuration for Avalanche Fuji
const FUJI_CONFIG = {
  chainId: 43113,
  ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  avalancheChainSelector: 14767482510784806043,
  aksTokenAddress: "",
};

async function main() {
  const [deployer, landAuthority] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Compliance Module
  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy();
  await compliance.deployed();
  console.log("Compliance module deployed to:", compliance.getAddress());

  // Deploy FarmToken (ERC1155 with CCIP)
  const FarmToken = await ethers.getContractFactory("FarmToken");
  complianceAddress = await compliance.getAddress();
  const farmToken = await FarmToken.deploy(
    deployer.address, // initialOwner
    landAuthority.address, // landRegistryAuthority
    complianceAddress, // compliance
    FUJI_CONFIG.aksTokenAddress, // aksStablecoin
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
  await aks.grantRole(await aks.MINTER_ROLE(), farmTokenAddress);

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

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networkDir = path.join(deploymentsDir, network.name);

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir);
  }

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
