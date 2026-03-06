const hre = require("hardhat");

async function main() {
  const contract = await (await hre.ethers.getContractFactory("TokenizeArt42")).deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log(`Contrat : ${addr}`);
  console.log(`BscScan : https://testnet.bscscan.com/address/${addr}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
