#!/usr/bin/env node
/*
  Usage:
    node code/scripts/upload-and-mint.js <title> <artist> <toAddress>

  .env:
    NFT_IMAGE_URI      - URL de l'image (GitHub raw)
    SEPOLIA_RPC_URL    - RPC Sepolia
    PRIVATE_KEY        - clé privée du owner
    CONTRACT_ADDRESS   - adresse du contrat déployé
*/

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node code/scripts/upload-and-mint.js <title> <artist> <toAddress>');
    process.exit(1);
  }

  const [title, artist, toAddress] = args;
  const imageURI = process.env.NFT_IMAGE_URI;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!imageURI) { console.error('Set NFT_IMAGE_URI in .env'); process.exit(1); }
  if (!contractAddress) { console.error('Set CONTRACT_ADDRESS in .env'); process.exit(1); }
  if (!process.env.PRIVATE_KEY) { console.error('Set PRIVATE_KEY in .env'); process.exit(1); }

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const artifact = require('../../artifacts/code/TokenizeArt42.sol/TokenizeArt42.json');
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  console.log(`Minting to ${toAddress} with image ${imageURI}`);
  const tx = await contract.mintNFT(toAddress, imageURI, title, artist);
  console.log('Tx sent:', tx.hash);
  await tx.wait();
  console.log('Mint confirmed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
