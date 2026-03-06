const hre = require("hardhat");

const CONTRACT_ADDRESS  = "0xTON_ADRESSE_CONTRAT_ICI";
const IMAGE_URI         = "https://raw.githubusercontent.com/Chaosum/42-tokenizeArt/main/image%20copy.png";
const RECIPIENT_ADDRESS = "0xTON_ADRESSE_WALLET_ICI";

const ABI = [
  "function mintNFT(address to, string memory imageURI) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function totalMinted() public view returns (uint256)",
];

async function main() {
  if (CONTRACT_ADDRESS === "0xTON_ADRESSE_CONTRAT_ICI" || RECIPIENT_ADDRESS === "0xTON_ADRESSE_WALLET_ICI") {
    throw new Error("Remplis CONTRACT_ADDRESS et RECIPIENT_ADDRESS dans mint.js");
  }

  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const tx = await contract.mintNFT(RECIPIENT_ADDRESS, IMAGE_URI);
  const receipt = await tx.wait();

  const tokenId = await contract.totalMinted() - 1n;
  const owner = await contract.ownerOf(tokenId);

  console.log(`Token ID  : ${tokenId}`);
  console.log(`Owner     : ${owner}`);
  console.log(`Tx        : https://testnet.bscscan.com/tx/${receipt.hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
