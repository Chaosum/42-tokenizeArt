require('dotenv').config();
const { ethers } = require("hardhat");
const { abi: ABI } = require("../artifacts/code/TokenizeArt42.sol/TokenizeArt42.json");

let CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet1 = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);

  console.log(`Compte 1 (owner) : ${wallet1.address}`);
  console.log(`Compte 2         : ${wallet2.address}`);

  // If running against a local node, prefer deploying a local instance even when CONTRACT_ADDRESS is set
  const network = await provider.getNetwork();
  if (network.chainId === 31337 && CONTRACT_ADDRESS) {
    console.log('Réseau local détecté (chainId 31337) — on ignore CONTRACT_ADDRESS défini dans .env pour éviter les erreurs de réseau.');
    CONTRACT_ADDRESS = undefined;
  }

  let contract1 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet1);
  let contract2 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet2);

  // Helpful error formatter: extracts revert reason and transaction hash when possible
  const formatError = (err) => {
    if (!err) return 'Unknown error';
    try {
      const parts = [];
      if (err.code) parts.push(`code=${err.code}`);
      const txHash = err.transactionHash || (err.transaction && err.transaction.hash) || (err.receipt && err.receipt.transactionHash);
      if (txHash) parts.push(`tx=${txHash}`);

      // common revert / message patterns
      const raw = err.reason || err.message || (err.error && err.error.message) || '';
      let reason = '';
      if (raw) {
        // try several regex patterns
        const m = raw.match(/execution reverted: (.*)/i) || raw.match(/revert(?:ed)?(?::)?\s*(.*)$/i);
        if (m && m[1]) reason = m[1].trim();
      }
      // fallback to including raw data (helpful when Hardhat returns hex data)
      if (!reason && err.error && err.error.data) {
        reason = `rawData=${err.error.data}`;
      }
      if (!reason && raw) reason = raw;
      if (reason) parts.push(`reason=${reason}`);
      return parts.join(' | ');
    } catch (e) {
      return String(err);
    }
  };

  console.log(`\nNom     : ${await contract1.name()}`);
  console.log(`Symbole : ${await contract1.symbol()}`);
  console.log(`Owner   : ${await contract1.owner()}`);
  console.log(`Total   : ${await contract1.totalMinted()}`);

  // If no contract address provided, deploy a fresh instance for demo
  if (!CONTRACT_ADDRESS) {
    console.log('\nAucun CONTRACT_ADDRESS fourni : déploiement d\'une instance locale pour la démo...');
    const factory = await ethers.getContractFactory('TokenizeArt42', wallet1);
    const deployed = await factory.deploy();
    await deployed.waitForDeployment();
    CONTRACT_ADDRESS = await deployed.getAddress();
    console.log('Contract déployé à :', CONTRACT_ADDRESS);
    // re-create contract instances attached to the new address
    contract1 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet1);
    contract2 = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet2);
  }

  // ========== Briques ==========

  const showOwner = async (tokenId) => {
    try {
      const owner = await contract1.ownerOf(tokenId);
      console.log(`  ownerOf(${tokenId}) : ${owner}`);
    } catch (err) {
      console.log(`  ownerOf(${tokenId}) : token inexistant`);
      console.log(`    détail erreur: ${formatError(err)}`);
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
      console.log(`  Mint broadcast (txHash: ${tx.hash})`);
      await tx.wait();
      const total = Number(await contract1.totalMinted());
      console.log(`  Mint OK → tokenId ${total - 1}`);
    } catch (err) {
      console.log(`  Mint échoué : ${formatError(err)}`);
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
      console.log(`  tokenURI(${tokenId}) : ${formatError(err)}`);
    }
  };

  const showApprovalStatus = async (tokenId) => {
    try {
      const ownerAddr = await contract1.ownerOf(tokenId);
      const approved = await contract1.getApproved(tokenId).catch(() => 'error');
      const isOp1 = await contract1.isApprovedForAll(ownerAddr, wallet1.address).catch(() => false);
      const isOp2 = await contract1.isApprovedForAll(ownerAddr, wallet2.address).catch(() => false);
      console.log(`  Approval status for token ${tokenId}: owner=${ownerAddr}`);
      console.log(`    getApproved: ${approved}`);
      console.log(`    isApprovedForAll(owner, wallet1): ${isOp1}`);
      console.log(`    isApprovedForAll(owner, wallet2): ${isOp2}`);
    } catch (e) {
      console.log(`  showApprovalStatus failed: ${formatError(e)}`);
    }
  };

  const performSafeTransferAsOwner = async (tokenId, to, data = undefined) => {
    try {
      const ownerAddr = await contract1.ownerOf(tokenId);
      let signer = null;
      if (ownerAddr.toLowerCase() === wallet1.address.toLowerCase()) signer = wallet1;
      else if (ownerAddr.toLowerCase() === wallet2.address.toLowerCase()) signer = wallet2;
      else {
        console.log(`  Cannot perform safeTransfer: owner ${ownerAddr} is not available in demo wallets`);
        return;
      }

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      let tx;
      if (data) tx = await contractWithSigner['safeTransferFrom(address,address,uint256,bytes)'](ownerAddr, to, tokenId, data);
      else tx = await contractWithSigner['safeTransferFrom(address,address,uint256)'](ownerAddr, to, tokenId);
      console.log(`  (owner) safeTransfer broadcast (txHash: ${tx.hash})`);
      await tx.wait();
      console.log(`  (owner) safeTransfer token ${tokenId} → ${to} : OK`);
    } catch (e) {
      console.log(`  performSafeTransferAsOwner failed: ${formatError(e)}`);
    }
  };

  const transfer = async (fromContract, from, to, tokenId) => {
    try {
      // choose signer based on `from` address (demo uses wallet1 and wallet2)
      let signer = null;
      if (from.toLowerCase() === wallet1.address.toLowerCase()) signer = wallet1;
      else if (from.toLowerCase() === wallet2.address.toLowerCase()) signer = wallet2;
      else signer = wallet1; // fallback

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // pre-check owner to provide clearer logs
      try {
        const actualOwner = await contract1.ownerOf(tokenId);
        if (actualOwner.toLowerCase() !== from.toLowerCase()) {
          console.log(`  WARN: owner(${tokenId}) = ${actualOwner} but trying transfer from ${from}`);
        }
      } catch (e) {
        console.log(`  WARN: owner(${tokenId}) query failed: ${formatError(e)}`);
      }

      const tx = await contractWithSigner.transferFrom(from, to, tokenId);
      console.log(`  Transfer broadcast (txHash: ${tx.hash})`);
      await tx.wait();
      console.log(`  Transfer token ${tokenId} : OK`);
    } catch (err) {
      console.log(`  Transfer token ${tokenId} échoué : ${formatError(err)}`);
    }
  };

  const safeTransfer = async (fromContract, from, to, tokenId, data = undefined) => {
    try {
      // pick signer based on `from` as with normal transfer
      let signer = null;
      if (from.toLowerCase() === wallet1.address.toLowerCase()) signer = wallet1;
      else if (from.toLowerCase() === wallet2.address.toLowerCase()) signer = wallet2;
      else signer = wallet1;

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // pre-check owner
      try {
        const actualOwner = await contract1.ownerOf(tokenId);
        if (actualOwner.toLowerCase() !== from.toLowerCase()) {
          console.log(`  WARN: owner(${tokenId}) = ${actualOwner} but trying safeTransfer from ${from}`);
        }
      } catch (e) {
        console.log(`  WARN: owner(${tokenId}) query failed: ${formatError(e)}`);
      }

      let tx;
      if (data) {
        tx = await contractWithSigner['safeTransferFrom(address,address,uint256,bytes)'](from, to, tokenId, data);
      } else {
        tx = await contractWithSigner['safeTransferFrom(address,address,uint256)'](from, to, tokenId);
      }
      console.log(`  safeTransfer broadcast (txHash: ${tx.hash})`);
      await tx.wait();
      console.log(`  safeTransfer token ${tokenId} : OK`);
    } catch (err) {
      console.log(`  safeTransfer token ${tokenId} échoué : ${formatError(err)}`);
    }
  };

  const approve = async (callerAddress, to, tokenId) => {
    try {
      let signer = null;
      if (callerAddress.toLowerCase() === wallet1.address.toLowerCase()) signer = wallet1;
      else if (callerAddress.toLowerCase() === wallet2.address.toLowerCase()) signer = wallet2;
      else signer = wallet1;

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contractWithSigner.approve(to, tokenId);
      console.log(`  Approve broadcast (txHash: ${tx.hash})`);
      await tx.wait();
      console.log(`  Approve token ${tokenId} pour ${to} : OK`);
    } catch (err) {
      console.log(`  Approve échoué : ${formatError(err)}`);
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

  // safe transfers (demonstration)
  console.log('\n--- Safe Transfer (safeTransferFrom) ---');
  await showApprovalStatus(0);
  await performSafeTransferAsOwner(0, wallet2.address); // try safe using the real owner signer when available
  // try with data
  await showApprovalStatus(0);
  await performSafeTransferAsOwner(0, wallet1.address, ethers.toUtf8Bytes('0x01')); // try safe with data
  await showBalances();

  console.log("\n--- Approve + transferFrom ---");
  await approve(wallet1.address, wallet2.address, 0); // wallet1 approuve wallet2 sur token 0
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

