require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ============================================================
// Configuration Hardhat pour le projet TokenizeArt42
// Réseau cible : Sepolia Testnet (Ethereum)
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

    // Sepolia testnet (Ethereum)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
  }
};
