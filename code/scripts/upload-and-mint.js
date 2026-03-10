#!/usr/bin/env node
/*
  Usage:
    node code/scripts/upload-and-mint.js <imagePath> <title> <artist> <toAddress>

  Env required in .env:
    NFT_STORAGE_API_KEY  - key from https://nft.storage
    SEPOLIA_RPC_URL or BSC_TESTNET_RPC or use localhost via --network
    PRIVATE_KEY          - deployer private key to sign mint
    CONTRACT_ADDRESS     - address of deployed TokenizeArt42

  This script uploads the image to nft.storage (IPFS), then calls mintNFT on the contract
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { NFTStorage, File } = require('nft.storage');
const { ethers } = require('hardhat');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error('Usage: node code/scripts/upload-and-mint.js <imagePath> <title> <artist> <toAddress>');
    process.exit(1);
  }

  const [imagePath, title, artist, toAddress] = args;

  const key = process.env.NFT_STORAGE_API_KEY;
  if (!key) {
    console.error('Set NFT_STORAGE_API_KEY in .env');
    process.exit(1);
  }

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error('Set CONTRACT_ADDRESS in .env to the deployed TokenizeArt42 address');
    process.exit(1);
  }

  // Read image
  const absPath = path.resolve(imagePath);
  if (!fs.existsSync(absPath)) {
    console.error('Image not found at', absPath);
    process.exit(1);
  }
  const imageBytes = await fs.promises.readFile(absPath);
  const imageFile = new File([imageBytes], path.basename(absPath), { type: 'image/png' });

  // Upload to nft.storage
  const client = new NFTStorage({ token: key });
  console.log('Uploading image to nft.storage...');
  const metadata = await client.store({
    name: title,
    description: `NFT minted by TokenizeArt42 — artist: ${artist}`,
    image: imageFile
  });

  // metadata.url is ipfs://{ipnft}/metadata.json
  console.log('Uploaded metadata:', metadata.url);
  // image URI typically available at metadata.data.image.href
  const imageURI = metadata.data.image?.href || (`ipfs://${metadata.ipnft}`);
  console.log('Image URI for minting:', imageURI);

  // Mint via Hardhat ethers
  const providerUrl = process.env.SEPOLIA_RPC_URL || process.env.BSC_TESTNET_RPC || 'http://127.0.0.1:8545';
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Set PRIVATE_KEY in .env');
    process.exit(1);
  }
  const wallet = new ethers.Wallet(privateKey, provider);

  // load contract ABI from compiled artifacts (path relative to code/scripts -> up two levels to repo root)
  const artifact = require(`../../artifacts/code/TokenizeArt42.sol/TokenizeArt42.json`);
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  console.log(`Minting on contract ${contractAddress} to ${toAddress} ...`);
  const tx = await contract.mintNFT(toAddress, imageURI, title, artist);
  console.log('Mint tx sent:', tx.hash);
  await tx.wait();
  console.log('Mint tx confirmed');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
