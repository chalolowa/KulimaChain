const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts-ccip/test/networks.js");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Chainlink config
  const routerAddress = networks[network.name].router;
  
  // Token addresses
  const cKES = network.name === "avalanche" 
    ? "0x5C6d5D6E4fF1f2D8A5F8736a9D2a4B0dC5bD5F5e" 
    : "0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F";
  
  const KFS = (await deployments.get("FarmToken")).address;

  await deploy("KulimaTokenManager", {
    from: deployer,
    args: [routerAddress, cKES, KFS],
    log: true,
  });
  
  const tokenManager = await ethers.getContract("KulimaTokenManager", deployer);
  
  // Configure destination chains
  const chains = [
    { selector: 14767482510784806043, address: "0xF694E193200268f9a4868e4Aa017A0118C9a8177" }, // Avalanche Fuji
    { selector: 16015286601757825753, address: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59" }  // Ethereum Sepolia
  ];
  
  for (const chain of chains) {
    await tokenManager.setDestinationContract(
      chain.selector,
      chain.address
    );
  }
  
  console.log("TokenManager deployed with CCIP support");

  // Set token manager in other contracts
  const insuranceFund = await ethers.getContract("InsuranceFund", deployer);
  await insuranceFund.updateTokenManager(tokenManager.address);
  
  const farmToken = await ethers.getContract("FarmToken", deployer);
  await farmToken.updateTokenManager(tokenManager.address);
  
  console.log("TokenManager integrated with all contracts");
};