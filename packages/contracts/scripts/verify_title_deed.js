const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');
const fs = require('fs');

async function verifyDeed(farmId) {
  const farmToken = await ethers.getContract("FarmToken");
  const farm = await farmToken.farmDetails(farmId);
  
  // 1. Retrieve deed from IPFS
  const ipfs = create({ url: 'https://ipfs.infura.io:5001' });
  const deedContent = [];
  for await (const chunk of ipfs.cat(farm.titleDeedCID)) {
    deedContent.push(chunk);
  }
  const deedFile = Buffer.concat(deedContent);
  
  // 2. Verify hash matches
  const computedHash = ethers.keccak256(deedFile);
  console.log(`On-chain hash: ${farm.titleDeedHash}`);
  console.log(`Computed hash: ${computedHash}`);
  console.log(`Hashes match: ${farm.titleDeedHash === computedHash}`);
  
  // 3. Verify government signature
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256", "string", "bytes32"],
      [farm.geoLocation, farm.sizeHectares, farm.titleDeedCID, farm.titleDeedHash]
    )
  );
  
  const signer = ethers.verifyMessage(
    ethers.getBytes(messageHash),
    "0x" + farm.signature.slice(130, 132) + farm.signature.slice(2, 130)
  );
  
  console.log(`Signer: ${signer}`);
  console.log(`Authority: ${await farmToken.landRegistryAuthority()}`);
  console.log(`Signature valid: ${signer === await farmToken.landRegistryAuthority()}`);
  
  // 4. Save deed for inspection
  fs.writeFileSync(`./verified_deeds/${farmId}.pdf`, deedFile);
  console.log(`Deed saved to verified_deeds/${farmId}.pdf`);
}

// Verify farm ID 0
verifyDeed(0);