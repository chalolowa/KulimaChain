// scripts/operations/mint_farm_tokens.js
const { ethers } = require("hardhat");

async function main() {
  const [owner, farmer] = await ethers.getSigners();
  const farmToken = await ethers.getContract("FarmToken", owner);
  
  // Tokenize farm and initiate cross-chain mint
  const geoLocation = "-1.2921,36.8219"; // Nairobi
  const sizeHectares = 50;
  const initialSupply = ethers.parseEther("1000000"); // 1M tokens
  const destinationChain = 14767482510784806043; // Avalanche Fuji
  
  // Calculate mint cost (1 token = 1 cKES)
  const valuation = await farmToken.getLandValuation(sizeHectares);
  const mintCost = valuation * 1e12; // Convert to wei (cKES has 6 decimals)
  
  // Approve cKES spending
  const cKESAddress = await farmToken.cKES();
  const cKES = await ethers.getContractAt("IERC20", cKESAddress);
  await cKES.connect(farmer).approve(farmToken.address, mintCost);
  
  // Execute cross-chain mint
  const tx = await farmToken.connect(farmer).tokenizeFarmWithMint(
    geoLocation,
    sizeHectares,
    initialSupply,
    farmer.address,
    destinationChain,
    { value: ethers.parseEther("0.1") } // CCIP fee
  );
  
  const receipt = await tx.wait();
  console.log(`Cross-chain mint initiated in tx: ${receipt.hash}`);
  
  // Listen for completion on destination chain
  console.log("Waiting for cross-chain mint completion...");
  farmToken.on("CrossChainMintCompleted", (beneficiary, amount, messageId) => {
    if (beneficiary === farmer.address) {
      console.log(`Mint completed! ${ethers.formatEther(amount)} tokens minted to ${beneficiary}`);
      process.exit(0);
    }
  });
  
  // Timeout after 5 minutes
  setTimeout(() => {
    console.error("Cross-chain mint timeout");
    process.exit(1);
  }, 300000);
}

main().catch(console.error);