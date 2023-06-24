// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
/*
const hre = require("hardhat");

async function main() {

  const OTC = await hre.ethers.getContractFactory("OTCV2");
  const otc = await OTC.deploy();

  console.log(
    `
    Deployed to testnet`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
*/


// Import the required dependencies
const { ethers } = require("hardhat");

async function main() {
  // Get the accounts from Hardhat
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Compile the contract
  const Contract = await ethers.getContractFactory("OTCV2");
  const contract = await Contract.deploy(
    /* Pass the required constructor arguments here */
    // Replace the placeholders with actual values
    /* IWorldID instance */,
    /* groupId */,
    /* actionId */
  );

  // Wait for the contract to be mined
  await contract.deployed();

  console.log("Contract deployed at address:", contract.address);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
