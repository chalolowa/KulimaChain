const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts-ccip/test/networks.js");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Chainlink config
  const routerAddress = networks[network.name].router;
  
  // cKES address (same as FarmToken)
  const cKES = network.name === "avalanche"
    ? "0x5C6d5D6E4fF1f2D8A5F8736a9D2a4B0dC5bD5F5e"
    : "0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F";

  await deploy("cKESMinter", {
    from: deployer,
    args: [routerAddress, cKES],
    log: true,
  });
  
  const minter = await ethers.getContract("cKESMinter", deployer);
  
  // Set source bridge (Ethereum Sepolia)
  const sepoliaSelector = 16015286601757825753;
  const sepoliaBridge = "0x..."; // Mainnet bridge address
  await minter.setSourceBridge(sepoliaSelector, sepoliaBridge);
  
  // Fund with cKES for demo
  const cKESContract = await ethers.getContractAt("IERC20", cKES);
  const fundTx = await cKESContract.transfer(
    minter.address,
    ethers.parseUnits("1000000", 6) // 1M cKES
  );
  await fundTx.wait();
  
  console.log("cKESMinter deployed and funded");
};
module.exports.tags = ["minter"];