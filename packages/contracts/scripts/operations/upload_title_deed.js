const { ethers } = require("hardhat");
const { create } = require('ipfs-http-client');

async function main() {
  const ipfs = create({ url: 'https://ipfs.infura.io:5001' });
  const [deployer, farmer] = await ethers.getSigners();
  
  // 1. Farmer uploads title deed to IPFS
  const deedPath = './deeds/kenya_farm_12345.pdf';
  const file = fs.readFileSync(deedPath);
  const { cid } = await ipfs.add(file);
  
  console.log(`Title deed uploaded to IPFS: ${cid.toString()}`);
  
  // 2. Generate deed hash
  const deedHash = ethers.keccak256(file);
  
  // 3. Get government signature (simulated)
  const govPrivateKey = process.env.GOVERNMENT_PRIVATE_KEY;
  const govSigner = new ethers.Wallet(govPrivateKey);
  
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256", "string", "bytes32"],
      ["-1.2921,36.8219", 50, cid.toString(), deedHash]
    )
  );
  
  const signature = await govSigner.signMessage(
    ethers.getBytes(messageHash)
  );
  
  // 4. Tokenize farm with verified deed
  const farmToken = await ethers.getContract("FarmToken", deployer);
  const tx = await farmToken.tokenizeFarmWithMint(
    "-1.2921,36.8219", // Location
    50, // Hectares
    ethers.parseEther("1000000"), // 1M tokens
    farmer.address,
    14767482510784806043, // Fuji selector
    cid.toString(),
    deedHash,
    signature,
    { value: ethers.parseEther("0.1") }
  );
  
  console.log(`Farm tokenized with deed in tx: ${tx.hash}`);
}

main();