const { ethers } = require("hardhat");
const { abi: ABI } = require("../artifacts/code/TokenizeArt42.sol/TokenizeArt42.json");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);

  console.log(`Compte 1 (owner) : ${wallet1.address}`);
  console.log(`Compte 2         : ${wallet2.address}`);

  const contract1 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet1);
  const contract2 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet2);

  console.log(`\nNom     : ${await contract1.name()}`);
  console.log(`Symbole : ${await contract1.symbol()}`);
  console.log(`Owner   : ${await contract1.owner()}`);
  console.log(`Total   : ${await contract1.totalMinted()}`);

  // ========== Briques ==========

  const showOwner = async (tokenId) => {
    try {
      const owner = await contract1.ownerOf(tokenId);
      console.log(`  ownerOf(${tokenId}) : ${owner}`);
    } catch (err) {
      console.log(`  ownerOf(${tokenId}) : token inexistant`);
    }
  };

  const showBalances = async () => {
    const b1 = await contract1.balanceOf(wallet1.address);
    const b2 = await contract1.balanceOf(wallet2.address);
    console.log(`  Balance compte 1 : ${b1} NFT`);
    console.log(`  Balance compte 2 : ${b2} NFT`);
  };

  const mint = async (contract, to, imageURI, title, artist) => {
    try {
      const tx = await contract.mintNFT(to, imageURI, title, artist);
      await tx.wait();
      const total = Number(await contract1.totalMinted());
      console.log(`  Mint OK → tokenId ${total - 1}`);
    } catch (err) {
      console.log(`  Mint échoué : ${err.message}`);
    }
  };

  const showTokenURI = async (tokenId) => {
    try {
      const uri = await contract1.tokenURI(tokenId);
      const b64 = uri.replace('data:application/json;base64,', '');
      const meta = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      console.log(`  tokenURI(${tokenId}) :`);
      console.log(`    name   : ${meta.name}`);
      console.log(`    artist : ${meta.artist}`);
      console.log(`    image  : ${meta.image}`);
    } catch (err) {
      console.log(`  tokenURI(${tokenId}) : ${err.message}`);
    }
  };

  const transfer = async (fromContract, from, to, tokenId) => {
    try {
      const tx = await fromContract.transferFrom(from, to, tokenId);
      await tx.wait();
      console.log(`  Transfer token ${tokenId} : OK`);
    } catch (err) {
      console.log(`  Transfer token ${tokenId} échoué : ${err.message}`);
    }
  };

  const approve = async (fromContract, to, tokenId) => {
    try {
      const tx = await fromContract.approve(to, tokenId);
      await tx.wait();
      console.log(`  Approve token ${tokenId} pour ${to} : OK`);
    } catch (err) {
      console.log(`  Approve échoué : ${err.message}`);
    }
  };

  // ========== Tests ==========

  const IMAGE_URI = process.env.NFT_IMAGE_URI;

  console.log("\n--- Mint ---");
  await mint(contract1, wallet1.address, IMAGE_URI, "42 - Digital Odyssey", "matth"); // OK
  await mint(contract1, wallet2.address, IMAGE_URI, "42 - The Enchanted Realm", "matth"); // OK
  await mint(contract2, wallet1.address, IMAGE_URI, "Fake mint", "hacker"); // doit échouer (pas owner)
  await showBalances();

  console.log("\n--- ownerOf / tokenURI ---");
  await showOwner(0);
  await showOwner(1);
  await showOwner(99); // inexistant
  await showTokenURI(0);

  console.log("\n--- Transfer ---");
  await transfer(contract1, wallet1.address, wallet2.address, 0); // OK
  await transfer(contract2, wallet2.address, wallet1.address, 0); // OK (wallet2 est owner)
  await transfer(contract2, wallet2.address, wallet1.address, 1); // doit échouer (wallet2 pas owner de 1)
  await showBalances();

  console.log("\n--- Approve + transferFrom ---");
  await approve(contract1, wallet2.address, 0); // wallet1 approuve wallet2 sur token 0
  await transfer(contract2, wallet1.address, wallet2.address, 0); // wallet2 utilise l'approbation
  await showOwner(0);

  console.log("\n--- Transfert de propriété du contrat ---");
  console.log(`  Owner actuel : ${await contract1.owner()}`);
  try {
    const tx = await contract1.transferOwnership(wallet2.address);
    await tx.wait();
    console.log(`  Ownership transféré à wallet2`);
    const tx2 = await contract2.transferOwnership(wallet1.address);
    await tx2.wait();
    console.log(`  Ownership rendu à wallet1`);
  } catch (err) {
    console.log(`  Erreur : ${err.message}`);
  }
  console.log(`  Owner final : ${await contract1.owner()}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });

