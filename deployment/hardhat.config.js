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
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // Chemins du projet
  // sources pointe vers le dossier code/ à la racine du repo
  paths: {
    sources: "../code",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // Réseaux disponibles
  networks: {
    // Réseau local pour les tests rapides (npx hardhat node)
    hardhat: {},

    // BNB Smart Chain Testnet ← réseau principal utilisé pour ce projet
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY], // Clé privée dans .env (jamais dans le code !)
      gasPrice: 20000000000, // 20 gwei
    },
  },

  // Configuration BscScan pour la vérification du contrat (optionnel)
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
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
