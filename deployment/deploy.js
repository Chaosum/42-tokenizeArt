// deployment/deploy.js
// Usage: npx hardhat run deployment/deploy.js --network sepolia

const { ethers } = require("hardhat");

async function main() {
  const factory = await ethers.getContractFactory("TokenizeArt42");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log(await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});