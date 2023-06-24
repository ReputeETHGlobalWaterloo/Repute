/* TODO: I want to simulate 1 user posting 5 offers by calling the postOffer function of a contract depoloyed at 0x7564bcd038784424ba1900cb99aad5dcd85ab019
on Polygon Mumbai testnet. Below is the function definition of postOffer

function postOffer(string memory _dealType, string memory _opportunityName, uint256 _expiryBlock, uint256 _sellerDeposit, uint256 _buyerDeposit) external payable{
    Deal memory newDeal;
    require(msg.value >= _sellerDeposit,"Not enough eth deposited from seller");
    newDeal.dealType = _dealType;
    newDeal.opportunityName = _opportunityName;
    newDeal.seller = msg.sender;
    newDeal.status = 0;
    newDeal.sellerDeposit = _sellerDeposit;
    newDeal.buyerDeposit = _buyerDeposit;//the seller sets the price of the deal
    newDeal.expiryBlock = _expiryBlock;

    deals.push(newDeal);
    emit OfferPosted(deals.length - 1, _dealType, _opportunityName, msg.sender, _sellerDeposit, _expiryBlock);

}
*/

const { ethers } = require("hardhat");

async function simulateOffers() {
  const contractAddress = "0x7564bcd038784424ba1900cb99aad5dcd85ab019";
  const contract = await ethers.getContractAt("OTCV2", contractAddress);

  const signer = await ethers.provider.getSigner();

await contract.connect(signer).postOffer(
    "bankruptcy claims",
    "FTX Claims for $2000",
    10000,
    ethers.parseEther("0.00001"),
    ethers.parseEther("0.00001"),
    {
    value: ethers.parseEther("0.0001"), // Make sure to send enough ETH as the seller deposit
    }
);

await contract.connect(signer).postOffer(
    "bankruptcy claims",
    "ATX Claims for $2000",
    10000,
    ethers.parseEther("0.00001"),
    ethers.parseEther("0.00001"),
    {
    value: ethers.parseEther("0.0001"), // Make sure to send enough ETH as the seller deposit
    }
);

await contract.connect(signer).postOffer(
    "saft",
    "$3000 of MokeySwap@$15m valuation",
    10000,
    ethers.parseEther("0.00001"),
    ethers.parseEther("0.00001"),
    {
    value: ethers.parseEther("0.0001"), // Make sure to send enough ETH as the seller deposit
    }
);

await contract.connect(signer).postOffer(
    "safe",
    "$3000 of Pepe Bridge@$25m valuation",
    10000,
    ethers.parseEther("0.00001"),
    ethers.parseEther("0.00001"),
    {
    value: ethers.parseEther("0.0001"), // Make sure to send enough ETH as the seller deposit
    }
);

await contract.connect(signer).postOffer(
    "airdrop",
    "50 farming accounts for Ooga Booga Swap",
    10000,
    ethers.parseEther("0.00001"),
    ethers.parseEther("0.00001"),
    {
    value: ethers.parseEther("0.0001"), // Make sure to send enough ETH as the seller deposit
    }
);

}

simulateOffers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
