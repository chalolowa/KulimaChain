const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// Configuration for Avalanche Fuji
const FUJI_CONFIG = {
  chainId: 43113,
  functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
  ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  avalancheChainSelector: 14767482510784806043,
  linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  aksTokenName: "Avalanche Kenya Shilling",
  aksTokenSymbol: "AKS",
  subscriptionId: process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID
};

// Load Chainlink Functions source code
const loadSourceCode = () => {
  const sourcePath = path.join(__dirname, "fetch-kes-rate.js");
  return fs.readFileSync(sourcePath, "utf8");
};

async function main() {
  console.log("🚀 Starting AKS Token Deployment...\n");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();
  
  console.log("📊 DEPLOYMENT DETAILS");
  console.log("=====================");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX\n`);
  
  // Deploy the AKS contract
  console.log("📋 CONTRACT COMPILATION");
  console.log("=======================");
  const AKS = await ethers.getContractFactory("AKS");
  
  console.log("✅ Contract compiled successfully");
  console.log("🔄 Deploying contract...\n");
  
  const gasEstimate = await AKS.getDeployTransaction(deployer.address).then(tx => 
    ethers.provider.estimateGas(tx)
  );
  
  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
  
  const aksToken = await AKS.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await aksToken.waitForDeployment();
  
  const deploymentTx = aksToken.deploymentTransaction();
  const receipt = await deploymentTx.wait();
  
  console.log("\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("==================================");
  console.log(`Contract Address: ${await aksToken.getAddress()}`);
  console.log(`Transaction Hash: ${deploymentTx.hash}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`Gas Price: ${ethers.formatUnits(receipt.gasPrice, "gwei")} gwei`);
  console.log(`Deployment Cost: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH\n`);
  
  // Get contract details
  console.log("📄 CONTRACT INFORMATION");
  console.log("=======================");
  console.log(`Name: ${await aksToken.name()}`);
  console.log(`Symbol: ${await aksToken.symbol()}`);
  console.log(`Decimals: ${await aksToken.decimals()}`);
  console.log(`Max Supply: ${ethers.formatEther(await aksToken.MAX_SUPPLY())} AKS`);
  console.log(`Current Supply: ${ethers.formatEther(await aksToken.totalSupply())} AKS`);
  console.log(`Owner: ${await aksToken.owner()}`);
  console.log(`Bridge: ${await aksToken.bridge()}`);
  console.log(`Reserve: ${await aksToken.reserve()}\n`);
  
  // Generate and save ABI
  const contractABI = AKS.interface.formatJson();
  
  console.log("💾 SAVING DEPLOYMENT ARTIFACTS");
  console.log("==============================");
  
  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networkDir = path.join(deploymentsDir, network.name);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  if (!fs.existsSync(networkDir)) {
    fs.mkdirSync(networkDir);
  }
  
  // Save deployment info
  const deploymentInfo = {
    contractName: "AvalancheKenyaShilling",
    contractAddress: await aksToken.getAddress(),
    deployer: deployer.address,
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    transaction: {
      hash: deploymentTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice.toString(),
      deploymentCost: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
    },
    timestamp: new Date().toISOString(),
    contractDetails: {
      name: await aksToken.name(),
      symbol: await aksToken.symbol(),
      decimals: await aksToken.decimals(),
      maxSupply: (await aksToken.MAX_SUPPLY()).toString(),
    }
  };
  
  // Save files
  fs.writeFileSync(
    path.join(networkDir, "AvalancheKenyaShilling.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  fs.writeFileSync(
    path.join(networkDir, "ABI.json"),
    contractABI
  );



  // ======================= 2. Deploy AKS Reserve ============================== //
  console.log("\nStep 2: Deploying AKS Reserve...");
  const AKSReserve = await ethers.getContractFactory("AKSReserve");
  
  // Chainlink Functions configuration
  const sourceCode = loadSourceCode();
  const aksTokenAddress = await aksToken.getAddress();
  
  const aksReserve = await AKSReserve.deploy(
    aksTokenAddress,
    FUJI_CONFIG.functionsRouter,
    sourceCode,
    "",
    subscriptionId,
    deployer.address // Initial auditor
  );
  console.log(`AKS Reserve deployed to: ${aksReserve.address}`);

  await aksReserve.waitForDeployment();

  const deploymentTsx = aksToken.deploymentTransaction();
  const txReceipt = await deploymentTx.wait();

  console.log("====================================");
  console.log(`Contract Address: ${await aksReserve.getAddress()}`);
  console.log(`Transaction Hash: ${deploymentTsx.hash}`);
  console.log(`Block Number: ${txReceipt.blockNumber}`);
  console.log(`Gas Used: ${txReceipt.gasUsed.toString()}`);
  console.log(`Gas Price: ${ethers.formatUnits(txReceipt.gasPrice, "gwei")} gwei`);
  console.log(`Deployment Cost: ${ethers.formatEther(txReceipt.gasUsed * receipt.gasPrice)} ETH\n`);
  
  // Get contract details
  console.log("📄 CONTRACT INFORMATION");
  console.log("=======================");
  console.log(`AKS Token: ${await aksReserve.token()}`);
  console.log(`Owner: ${await aksReserve.owner()}`);
  console.log(`Total KES Reserves: ${await aksReserve.totalKESReserves()}`);
  console.log(`Min Collateral Ratio: ${await aksReserve.minCollateralRatio()}%`);
  console.log(`Max Single Mint: ${ethers.formatEther(await aksReserve.maxSingleMint())} AKS`);
  console.log(`Auditors Count: ${await aksReserve.auditorsCount()}`);
  console.log(`Auditors Required: ${await aksReserve.auditorsRequired()}`);
  console.log(`Is Paused: ${await aksReserve.paused()}\n`);

    // Save deployment info
  const deploymentReserveInfo = {
    contractName: "AKSReserve",
    contractAddress: await aksReserve.getAddress(),
    deployer: deployer.address,
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    configuration: {
      aksToken: aksTokenAddress,
      initialAuditor: deployer.address,
      initialOwner: deployer.address,
    },
    transaction: {
      hash: deploymentTsx.hash,
      blockNumber: txReceipt.blockNumber,
      gasUsed: txReceipt.gasUsed.toString(),
      gasPrice: txReceipt.gasPrice.toString(),
      deploymentCost: ethers.formatEther(txReceipt.gasUsed * txReceipt.gasPrice),
    },
    timestamp: new Date().toISOString(),
  };

  // Save files
  fs.writeFileSync(
    path.join(networkDir, "AKSReserve.json"),
    JSON.stringify(deploymentReserveInfo, null, 2)
  );
  


  // ======================= 3. Deploy AKSBridge ==================================== //
  console.log("\n🌉 Deploying AKS Bridge...");
  const AKSBridge = await ethers.getContractFactory("AKSBridge");
  const aksBridge = await AKSBridge.deploy(
    FUJI_CONFIG.ccipRouter,
    aksTokenAddress,
    FUJI_CONFIG.avalancheChainSelector
  );
  await aksBridge.waitForDeployment();
  const aksBridgeAddress = await aksBridge.getAddress();
  console.log("✅ AKS Bridge deployed to:", aksBridgeAddress);

    // Set reserve in token contract
  const aksReserveAddress = await aksReserve.getAddress();
  let tx = await aksToken.setReserve(aksReserveAddress);
  await tx.wait();
  console.log("Set reserve in token contract");
  
  // Set bridge in token contract
  tx = await aksToken.setBridge(aksBridgeAddress);
  await tx.wait();
  console.log("Set bridge in token contract");
  
  // Set bridge in reserve contract
  tx = await aksReserve.setBridge(aksBridgeAddress);
  await tx.wait();
  console.log("Set bridge in reserve contract");
  
  // Set reserve in bridge contract
  tx = await aksBridge.setReserve(aksReserveAddress);
  await tx.wait();
  console.log("Set reserve in bridge contract");

  const deploymentBridgeTsx = aksToken.deploymentTransaction();
  const txBridgeReceipt = await deploymentTx.wait();

  // Save deployment addresses
  const deploymentBridgeInfo = {
    contractName: "AKSBridge",
    contractAddress: aksBridgeAddress,
    network: "Avalanche Fuji",
    deployer: deployer.address,
    timestamp: Date.now(),
    transaction: {
      hash: deploymentBridgeTsx.hash,
      blockNumber: txBridgeReceipt.blockNumber,
      gasUsed: txBridgeReceipt.gasUsed.toString(),
      gasPrice: txBridgeReceipt.gasPrice.toString(),
      deploymentCost: ethers.formatEther(txBridgeReceipt.gasUsed * txBridgeReceipt.gasPrice),
    },
  };

  fs.writeFileSync(
    path.join(networkDir, "AKSBridge.json"),
    JSON.stringify(deploymentBridgeInfo, null, 2)
  );

  console.log("\n🎉 Deployment Complete!!!");  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});