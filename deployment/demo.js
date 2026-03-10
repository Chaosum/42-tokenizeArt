const { ethers } = require("hardhat");
const { abi: ABI } = require("../artifacts/code/TokenizeArt42.sol/TokenizeArt42.json");

// Adresse du contrat déjà déployé (remplacez par la valeur réelle)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC || process.env.SEPOLIA_RPC_URL);

  // Chargement des deux wallets
  const wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2 || process.env.PRIVATE_KEY, provider);

  console.log("Comptes utilisés");
  console.log(`Compte 1 (owner/déployeur) : ${wallet1.address}`);
  console.log(`Compte 2                   : ${wallet2.address}`);

  const bal1ETH = await provider.getBalance(wallet1.address);
  const bal2ETH = await provider.getBalance(wallet2.address);
  console.log(`Solde ETH compte 1 : ${ethers.formatEther(bal1ETH)} ETH`);
  console.log(`Solde ETH compte 2 : ${ethers.formatEther(bal2ETH)} ETH`);

  // Instance du contrat
  const contract1 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet1); // signé par compte1

  console.log("Infos du NFT");
  console.log(`Nom     : ${await contract1.name()}`);
  console.log(`Symbole : ${await contract1.symbol()}`);
  console.log(`Owner   : ${await contract1.owner()}`);
  console.log(`Total Minted : ${await contract1.totalMinted()}`);

  // Mint un NFT (si tu es owner)
  try {
    console.log("Tentative de mint d'un NFT vers le compte 2...");
    const tx = await contract1.mintNFT(wallet2.address, "ipfs://CID_EXAMPLE", "42 - The Enchanted Realm", "matth");
    await tx.wait();
    console.log("Mint tx confirmée");
  } catch (err) {
    console.log("Mint échoué (peut-être pas owner) :", err.message);
  }

  // Affiche le total minté et tokenURI du dernier token (si existant)
  const total = Number(await contract1.totalMinted());
  if (total > 0) {
    const lastId = total - 1;
    console.log(`Token ID ${lastId} owner: ${await contract1.ownerOf(lastId)}`);
    console.log(`Token URI: ${await contract1.tokenURI(lastId)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erreur :", err.message || err);
    process.exit(1);
  });
