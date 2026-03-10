require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ============================================================
// Configuration Hardhat pour le projet TokenizeArt42
// Réseau cible : BNB Smart Chain Testnet (Chain ID : 97)
// ============================================================

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Version du compilateur Solidity
  solidity: {
    version: "0.8.20",
    settings: {
      // Use viaIR to work around certain "stack too deep" issues during compilation
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // Chemins du projet
  // sources pointe vers le dossier code/ à la racine du repo
  paths: {
    sources: "./code",
    // Use root artifacts/cache/tests to match current compiled output
    artifacts: "./artifacts",
    cache: "./cache",
    tests: "./test",
  },

  // Réseaux disponibles
  networks: {
    // Réseau local pour les tests rapides (npx hardhat node)
    hardhat: {},

    // BNB Smart Chain Testnet ← réseau principal utilisé pour ce projet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      // If PRIVATE_KEY isn't set, leave accounts undefined so Hardhat uses its default accounts
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
      gasPrice: 20000000000, // 20 gwei
    },

    // Sepolia testnet (Ethereum)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  },

  // Configuration BscScan pour la vérification du contrat (optionnel)
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
    ],
  },
};
