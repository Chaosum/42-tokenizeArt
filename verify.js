#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');

const contractAddress = process.env.CONTRACT_ADDRESS;

if (!contractAddress) {
  console.error('Erreur: CONTRACT_ADDRESS n\'est pas défini dans le fichier .env');
  process.exit(1);
}

console.log(`✓ Vérification du contrat à ${contractAddress} sur Sepolia...`);

try {
  execSync(`npx hardhat verify --network sepolia ${contractAddress}`, {
    stdio: 'inherit',
  });
  console.log('✓ Vérification réussie !');
} catch (err) {
  console.error('La vérification a échoué.');
  process.exit(1);
}
