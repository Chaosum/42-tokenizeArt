const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying TokenizeArt42...');
  const Factory = await ethers.getContractFactory('TokenizeArt42');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log('Deployed at', addr);

  // Use the first signer (deployer) and second account as receiver
  const [deployer, receiver] = await ethers.getSigners();
  console.log('Deployer', deployer.address);
  console.log('Receiver', receiver.address);

  console.log('Minting token to receiver...');
  const tx = await contract.connect(deployer).mintNFT(receiver.address, 'ipfs://CID_TEST', '42 - Test', 'matth');
  await tx.wait();
  console.log('Minted - tx hash', tx.hash);

  const total = await contract.totalMinted();
  // total is a BigInt (ethers v6); compute lastId accordingly
  console.log('Total minted:', total.toString());
  const lastId = typeof total === 'bigint' ? total - 1n : total - 1;
  console.log('LastId:', lastId.toString());

  const owner = await contract.ownerOf(lastId);
  console.log('Owner of last token:', owner);

  try {
    const uri = await contract.tokenURI(lastId);
    console.log('tokenURI:', uri);
  } catch (e) {
    console.warn('tokenURI failed (decoded data may contain non-UTF8). Falling back to getMetadata.');
    const meta = await contract.getMetadata(lastId);
    console.log('Metadata -> name:', meta.name);
    console.log('Metadata -> artist:', meta.artist);
    console.log('Metadata -> imageURI:', meta.imageURI);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error in test-run:', err);
    process.exit(1);
  });
