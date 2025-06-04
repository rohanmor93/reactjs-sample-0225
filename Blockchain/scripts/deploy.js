const hre = require("hardhat");

async function main() {
  const NFTBadge = await hre.ethers.getContractFactory("NFTBadge");
  const nftBadge = await NFTBadge.deploy();

  await nftBadge.waitForDeployment();

  const address = await nftBadge.getAddress();
  console.log(`NFTBadge deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
