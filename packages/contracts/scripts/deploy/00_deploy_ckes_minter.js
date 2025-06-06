const { ethers } = require("hardhat");
const { networks } = require("@chainlink/contracts-ccip/test/networks.js");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  // Chainlink config
  const routerAddress = networks[network.name].router;
  
  // cKES address
  const cKES = network.name = "0x3eBDeaA0DB3FfDe96E7a0DBBAFEC961FC50F725F";

  await deploy("cKESMinter", {
    from: deployer,
    args: [routerAddress, cKES],
    log: true,
  });
  
  const minter = await ethers.getContract("cKESMinter", deployer);
  console.log("cKESMinter deployed at:", minter.address);
  
  // Set source bridge (Ethereum Sepolia)
  const chainSelector = "16015286601757825753"; // Sepolia chain selector
  const sepoliaBridge = "0x0000000000000000000000000000000000000000"; // bridge address
  await minter.setSourceBridge(chainSelector, sepoliaBridge);
  
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