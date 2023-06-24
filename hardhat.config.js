require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const ZKEVM_PRIVATE_KEY = "1a5b9f238d6e4f0c72a96bc3d8f7e2d0a1b3c4d5e6f7a8b9c1d2e3f4a5b6c7d8";

module.exports = {
  solidity: "0.8.18",
  networks: {
    zkevm: {
      url: `https://fittest-summer-telescope/0b10f4003d89e91d8b3dc9c4226999b16a17f072`,
      accounts: [`0x${ZKEVM_PRIVATE_KEY}`],
    },
  }
};
