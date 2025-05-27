import { ethers } from "hardhat";

async function main() {
  const Wallet = await ethers.getContractFactory("SimpleWallet");
  const wallet = await Wallet.deploy();

  await wallet.deployed();
  console.log(` SimpleWallet déployé à l'adresse : ${wallet.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
