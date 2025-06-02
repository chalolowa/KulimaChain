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
  const routerAddress = networks[network.name].router;
  const compliance = "0x2f68C1bEa98ceBcEADA2c2dD89E20D0E2F6f4Dd2"; // Test compliance
  const landOracle = (await deployments.get("WeatherOracle")).address;
  
  // cKES address (testnet)
  const cKES = network.name === "avalanche"
    ? "0x5C6d5D6E4fF1f2D8A5F8736a9D2a4B0dC5bD5F5e" // Mainnet cKES
    : "0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F"; // Fuji test cKES

  await deploy("FarmToken", {
    from: deployer,
    args: [routerAddress, compliance, landOracle, cKES, landRegistryAuthority],
    log: true,
  });
  
  const farmToken = await ethers.getContract("FarmToken", deployer);
  
  // Set destination bridge (Avalanche Fuji)
  const fujiSelector = 14767482510784806043;
  const fujiBridge = "0x..."; // Will deploy separately
  await farmToken.setDestinationBridge(fujiSelector, fujiBridge);
  
  console.log("FarmToken deployed with CCIP support");
};
module.exports.tags = ["token"];
module.exports.dependencies = ["oracle"];