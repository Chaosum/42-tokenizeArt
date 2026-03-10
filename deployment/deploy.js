// deployment/deploy.js
// Usage: npx hardhat run deployment/deploy.js --network bscTestnet

const { ethers } = require("hardhat");

async function main() {
  const factory = await ethers.getContractFactory("TokenizeArt42");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("Deployed TokenizeArt42 at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});