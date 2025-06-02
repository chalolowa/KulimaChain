const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts/ccip/test/networks.js");
const { promises: fs } = require('fs');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Chainlink config
  const routerAddress = networks[network.name].functionsRouter;
  const donId = process.env.CHAINLINK_FUNCTIONS_DON_ID;
  const subscriptionId = process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID;
  
  // Stablecoin addresses
  const premiumToken = network.name === "avalanche"
    ? "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" // USDC.e
    : "0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F"; // Fuji test USDC
    
  const payoutToken = premiumToken;
  const gasLimit = 300000;
  
  await deploy("InsuranceFund", {
    from: deployer,
    args: [
      routerAddress,
      premiumToken,
      payoutToken,
      subscriptionId,
      gasLimit,
      donId
    ],
    log: true,
  });
  
  // Add contract as consumer
  const insuranceFund = await ethers.getContract("InsuranceFund", deployer);
  const functionsRouter = await ethers.getContractAt(
    "FunctionsRouter",
    routerAddress,
    deployer
  );
  
  await functionsRouter.addConsumer(
    subscriptionId,
    insuranceFund.target
  );
  
  console.log("InsuranceFund deployed and added as consumer");
  
  // Create sample policy
  const policyTx = await insuranceFund.createPolicy(
    deployer, 
    ethers.parseUnits("50", 6), // $50 premium
    ethers.parseUnits("500", 6), // $500 coverage
    90 * 24 * 60 * 60, // 90 days
    "-1.2921,36.8219" // Nairobi coordinates
  );
  await policyTx.wait();
  console.log("Sample policy created");
  
  // Upload secrets to DON
  try {
    const secretsUpload = spawnSync('npx', ['hardhat', 'run', 'scripts/upload_secrets.js', '--network', network.name], {
      stdio: 'inherit'
    });
    if (secretsUpload.status !== 0) {
      console.error('Secrets upload failed');
    }
  } catch (error) {
    console.error('Error uploading secrets:', error);
  }
};
module.exports.tags = ["insurance"];