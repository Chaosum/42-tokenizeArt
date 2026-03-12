// Usage: npx hardhat run mint/upload-and-mint.js --network sepolia
// Set MINT_TITLE, MINT_ARTIST, MINT_TO in .env
require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const { CONTRACT_ADDRESS, NFT_IMAGE_URI, MINT_TITLE, MINT_ARTIST, MINT_TO } = process.env;
  if (!MINT_TITLE || !MINT_ARTIST || !MINT_TO) {
    console.error('Set MINT_TITLE, MINT_ARTIST, MINT_TO in .env');
    process.exit(1);
  }

  const contract = await ethers.getContractAt('TokenizeArt42', CONTRACT_ADDRESS);
  const tx = await contract.mintNFT(MINT_TO, NFT_IMAGE_URI, MINT_TITLE, MINT_ARTIST);
  console.log('Tx:', tx.hash);
  const receipt = await tx.wait();
  const event = receipt.logs.find(l => l.fragment?.name === 'NFTMinted');
  console.log('Minted token ID:', event?.args?.tokenId?.toString() ?? 'check Etherscan');
}

main().catch((err) => { console.error(err); process.exit(1); });
