const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts-ccip/test/networks.js");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Government authority address (testnet representative)
  const landRegistryAuthority = network.name === "avalanche" 
    ? "0x8528a2Ee5d8e3d48F7a7d8d4a0F1A3d8B8e6F1a2" // Mainnet authority
    : "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account 1
  
  // Chainlink config
  const TokenManager = "0x0000000000000000000000000000000000000001"; // Placeholder for token manager
  const compliance = "0x2f68C1bEa98ceBcEADA2c2dD89E20D0E2F6f4Dd2"; // Test compliance
  const landOracle = network.name === "avalanche"
    ? "0x0A77230d17318075983913bC2145DB16C7366156" // Example: AVAX/USD on Avalanche
    : "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Example: ETH/USD on Sepolia

  await deploy("FarmToken", {
    from: deployer,
    args: [TokenManager, compliance, landOracle, landRegistryAuthority],
    log: true,
  });
  
  const farmToken = await ethers.getContract("FarmToken", deployer);
  
  console.log("FarmToken deployed successfully");
  console.log("Contract address:", farmToken.address);
  console.log("Land Registry Authority:", landRegistryAuthority);
  console.log("Land Oracle:", landOracle);
  console.log("Compliance:", compliance);
};
module.exports.tags = ["token"];
module.exports.dependencies = ["oracle"];