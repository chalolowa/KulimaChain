const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts/ccip/test/networks.js");
const { promises: fs } = require('fs');
const { spawnSync } = require('child_process');

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Chainlink config
  const routerAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"; // Functions Router address
  const donId = process.env.CHAINLINK_FUNCTIONS_DON_ID;
  const subscriptionId = process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID;
    
  const gasLimit = 300000;

  const TokenManager = "0x0000000000000000000000000000000000000001"; // Placeholder for token manager
  
  await deploy("InsuranceFund", {
    from: deployer,
    args: [
      routerAddress,
      TokenManager,
      parseInt(subscriptionId),
      gasLimit,
      donId
    ],
    log: true,
  });

  const insuranceFund = await ethers.getContract("InsuranceFund", deployer);

  console.log("InsuranceFund deployed successfully");
  console.log("Contract address:", insuranceFund.target || insuranceFund.address);
  
  // Add contract as consumer
  try {
    const functionsRouter = await ethers.getContractAt(
    ["function addConsumer(uint64 subscriptionId, address consumer) external",
        "function getSubscription(uint64 subscriptionId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)"
      ],
    routerAddress,
    deployer
  );
  
  await functionsRouter.addConsumer(
    parseInt(subscriptionId),
    insuranceFund.target || insuranceFund.address
  );
  
  console.log("InsuranceFund added as Functions consumer");
  } catch (error) {
    console.error("Error adding consumer:", error);
    console.log("Please manually add the contract as a consumer in the Chainlink Functions dashboard");
  }

  // Upload secrets to DON
  try {
    const secretsUpload = spawnSync('npx', [
      'hardhat', 
      'run', 
      'scripts/operations/upload_secrets.js', 
      '--network', 
      network.name
    ], {
      stdio: 'inherit'
    });
    
    if (secretsUpload.status === 0) {
      console.log("Secrets uploaded successfully");
    } else {
      console.warn("Secrets upload failed or script not found");
    }
  } catch (error) {
    console.warn("Could not upload secrets:", error.message);
    console.log("Please upload API secrets manually using Chainlink Functions");
  }
  
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
  
};
module.exports.tags = ["insurance"];