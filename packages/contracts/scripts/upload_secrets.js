require('dotenv').config();
const { ethers } = require('hardhat');
const { promises: fs } = require('fs');
const { spawnSync } = require('child_process');

async function main() {
  // Encrypt secrets
  const encryptCommand = `echo -n '{"OPEN_WEATHER_API_KEY":"${process.env.OPEN_WEATHER_API_KEY}","TOMORROWIO_API_KEY":"${process.env.TOMORROW_API_KEY}"}' | openssl enc -aes-256-cbc -pbkdf2`;
  const encryptedSecrets = spawnSync('bash', ['-c', encryptCommand], { encoding: 'utf8' }).stdout.trim();

  // Save to file
  await fs.writeFile('encrypted_secrets.txt', encryptedSecrets);

  // Connect to Chainlink Contracts
  const [deployer] = await ethers.getSigners();
  const functionsRouterAddress = '0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0'; // Fuji
  const functionsRouter = await ethers.getContractAt(
    ["function addConsumer(uint64 subscriptionId, address consumer) external",
        "function getSubscription(uint64 subscriptionId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)"
      ],
    functionsRouterAddress,
    deployer
  );

  // Upload encrypted secrets
  const encryptedSecretsData = await fs.readFile('encrypted_secrets.txt', 'utf8');
  const uploadTx = await functionsRouter.routeSecrets(
    process.env.CHAINLINK_FUNCTIONS_SUBSCRIPTION_ID,
    encryptedSecretsData
  );
  
  const receipt = await uploadTx.wait();
  console.log(`Secrets uploaded in tx: ${receipt.transactionHash}`);
}

main().catch(console.error);