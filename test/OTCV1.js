// Import the necessary libraries and dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Start the test block
describe("OTC", function () {
  let otc;
  let admin;
  let seller;
  let buyer;
  let attestor;

  before(async function () {
    // Get the signers from Hardhat
    [admin, seller, buyer, attestor] = await ethers.getSigners();

    // Deploy the OTC contract
    const OTC = await ethers.getContractFactory("OTC");
    otc = await OTC.deploy();
    //await otc.deployed();
  });

  it("should post an offer", async function () {
    // Post an offer by the seller
    const dealType = "bankruptcy claims";
    const opportunityName = "FTX claim";
    const expiryBlock = 10000;
    const sellerDeposit = ethers.parseEther("1");
    const buyerDeposit = ethers.parseEther("2");

    await otc.connect(seller).postOffer(dealType, opportunityName, expiryBlock, sellerDeposit, buyerDeposit, { value: sellerDeposit });

    // Check the emitted event
    const offerPostedEvent = await getEvent(otc, "OfferPosted");
    expect(offerPostedEvent.dealId).to.equal(0);
    expect(offerPostedEvent.dealType).to.equal(dealType);
    expect(offerPostedEvent.opportunityName).to.equal(opportunityName);
    expect(offerPostedEvent.seller).to.equal(seller.address);
    expect(offerPostedEvent.sellerDeposit).to.equal(sellerDeposit);
    expect(offerPostedEvent.expiryBlock).to.equal(expiryBlock);
  });

  it("should take an offer", async function () {
    // Take the offer by the buyer
    const dealId = 0;
    const buyerDeposit = ethers.parseEther("2");

    await otc.connect(buyer).takeOffer(dealId, { value: buyerDeposit });

    // Check the emitted event
    const offerTakenEvent = await getEvent(otc, "OfferTaken");
    expect(offerTakenEvent.dealId).to.equal(dealId);
    expect(offerTakenEvent.buyer).to.equal(buyer.address);
    expect(offerTakenEvent.buyerDeposit).to.equal(buyerDeposit);
  });

  it("should settle a trade", async function () {
    
    // Settle the trade by the attestor
    const dealId = 0;
    await otc.connect(attestor).settleTrade(dealId);

    // Check the emitted event
    const tradeSettledEvent = await getEvent(otc, "TradeSettled");
    expect(tradeSettledEvent.dealId).to.equal(dealId);
    expect(tradeSettledEvent.seller).to.equal(seller.address);
    expect(tradeSettledEvent.buyer).to.equal(buyer.address);
  });

  it("should swap the attestor", async function () {
    // Swap the attestor by the contract admin
    const dealId = 0;
    const newAttestor = attestor.address;

    await otc.connect(seller).swapAttestor(dealId, newAttestor);

    // Check the emitted event
    const attestorSwappedEvent = await getEvent(otc, "AttestorSwapped");
    expect(attestorSwappedEvent.dealId).to.equal(dealId);
    expect(attestorSwappedEvent.newAttestor).to.equal(newAttestor);
  });

  it("should extend the expiry", async function () {
    // Extend the expiry by the attestor
    const dealId = 0;
    const newExpiry = 5;

    await otc.connect(attestor).extendExpiry(dealId, newExpiry);

    // Check the emitted event
    const expiryExtendedEvent = await getEvent(otc, "ExpiryExtended");
    expect(expiryExtendedEvent.dealId).to.equal(dealId);
    expect(expiryExtendedEvent.newExpiry).to.equal(newExpiry);
  });

  it("should refund a deal", async function () {
    // Refund the deal by the seller

    const dealId = 0;

    await otc.connect(seller).refund(dealId);

    // Check the emitted event
    const refundedEvent = await getEvent(otc, "Refunded");
    expect(refundedEvent.dealId).to.equal(dealId);
    expect(refundedEvent.seller).to.equal(seller.address);
    expect(refundedEvent.buyer).to.equal(buyer.address);

  });

  // Helper function to get the emitted events
  async function getEvent(contract, eventName) {
    const events = await contract.queryFilter(contract.filters[eventName]());
    return events[events.length - 1].args;
  }
});
