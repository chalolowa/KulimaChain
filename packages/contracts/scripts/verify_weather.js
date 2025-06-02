const { ethers } = require("hardhat");

async function main() {
  const insuranceFund = await ethers.getContract("InsuranceFund");
  const policyId = "0x..."; // Replace with actual policy ID
  
  // Trigger weather verification
  const tx = await insuranceFund.evaluatePolicy(policyId);
  const receipt = await tx.wait();
  
  console.log(`Weather verification triggered in tx: ${receipt.transactionHash}`);
  
  // Listen for fulfillment
  insuranceFund.on("RequestFulfilled", (requestId, response, err) => {
    const result = ethers.decodeBytes32String(response);
    console.log(`Weather verification result: ${result}`);
    process.exit(0);
  });
  
  // Timeout after 5 minutes
  setTimeout(() => {
    console.error("Verification timeout");
    process.exit(1);
  }, 300000);
}

main().catch(console.error);