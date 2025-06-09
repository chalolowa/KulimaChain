import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

const AVALANCHE_URL = process.env.AVALANCHE_FUJI_RPC_URL || "";
const SEPOLIA_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "fuji",
  networks: {
    fuji: {
      url: AVALANCHE_URL,
      accounts: [PRIVATE_KEY],
      chainId: 43113
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: ETHERSCAN,
      sepolia: ETHERSCAN
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
