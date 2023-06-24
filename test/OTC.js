// Import the necessary modules from Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OTC Contract", function () {
    let OTC;
    let otc;
    let owner;
    let addr1;
    let addr2;
  
    beforeEach(async function () {
      // Deploy the OTC contract
      OTC = await ethers.getContractFactory("OTC");
      [owner, addr1, addr2] = await ethers.getSigners();
      otc = await OTC.deploy();
      //await otc.deployed();
    });
  
    describe("Constructor", function () {
      it("Should set the contract admin as the deployer", async function () {
        expect(await otc.admin()).to.equal(owner.address);
      });
    });
  
    describe("Post Offer", function () {
      it("Should add a new deal with the provided details", async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
        const deal = await otc.deals(0);
  
        expect(deal.dealType).to.equal("bankruptcy claims");
        expect(deal.opportunityName).to.equal("FTX claim");
        expect(deal.seller).to.equal(owner.address);
        expect(deal.status).to.equal(0);
        expect(deal.sellerDeposit).to.equal(ethers.parseEther("1"));
        expect(deal.expiryBlock).to.equal(1000);
      });
  
      it("Should require the seller to deposit an amount greater than or equal to the seller deposit", async function () {
        await expect(otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("2"))).to.be.revertedWith(
          "revert"
        );
      });
    });
  
    describe("Take Offer", function () {
      beforeEach(async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
      });
  
      it("Should allow a buyer to take an available deal", async function () {
        await otc.connect(addr1).takeOffer(0, { value: ethers.parseEther("1") });
        const deal = await otc.deals(0);
  
        expect(deal.buyer).to.equal(addr1.address);
        expect(deal.buyerDeposit).to.equal(ethers.parseEther("1"));
        expect(deal.status).to.equal(1);
      });
  
      it("Should revert when trying to take an already taken deal", async function () {
        await otc.connect(addr1).takeOffer(0, { value: ethers.parseEther("1") });
        await expect(otc.connect(addr2).takeOffer(0, { value: ethers.parseEther("1") })).to.be.revertedWith(
          "Deal not available"
        );
      });
  
      it("Should revert when trying to take an invalid deal ID", async function () {
        await expect(otc.connect(addr1).takeOffer(1, { value: ethers.parseEther("1") })).to.be.revertedWith(
          "Invalid deal ID"
        );
      });
    });
  
    describe("Settle Trade", function () {
      beforeEach(async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
        await otc.connect(addr1).takeOffer(0, { value: ethers.parseEther("1") });
      });
  
      it("Should settle a taken deal", async function () {
        await otc.settleTrade(0);
        const deal = await otc.deals(0);
  
        expect(deal.status).to.equal(2);
        expect(await owner.getBalance()).to.equal(ethers.parseEther("1"));
        expect(await addr1.getBalance()).to.equal(ethers.parseEther("0"));
      });
  
      it("Should revert when trying to settle an invalid deal ID", async function () {
        await expect(otc.settleTrade(1)).to.be.revertedWith("Invalid deal ID");
      });
  
      it("Should revert when trying to settle a deal that has not been taken", async function () {
        await expect(otc.settleTrade(0)).to.be.revertedWith("Deal not taken");
      });
    });
  
    describe("Swap Attestor", function () {
      beforeEach(async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
      });
  
      it("Should allow the contract admin to swap the attestor", async function () {
        await otc.swapAttestor(0, addr1.address);
        const deal = await otc.deals(0);
  
        expect(deal.attestor).to.equal(addr1.address);
      });
  
      it("Should revert when trying to swap the attestor by a non-admin", async function () {
        await expect(otc.connect(addr1).swapAttestor(0, addr2.address)).to.be.revertedWith("Only contract admin can swap the attestor");
      });
  
      it("Should revert when trying to swap the attestor for an invalid deal ID", async function () {
        await expect(otc.swapAttestor(1, addr1.address)).to.be.revertedWith("Invalid deal ID");
      });
    });
  
    describe("Extend Expiry", function () {
      beforeEach(async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
        await otc.connect(addr1).takeOffer(0, { value: ethers.parseEther("1") });
      });
  
      it("Should allow the attestor to extend the expiry of a taken deal", async function () {
        await otc.connect(owner).swapAttestor(0, addr1.address);
        await otc.connect(addr1).extendExpiry(0, 2000);
        const deal = await otc.deals(0);
  
        expect(deal.expiryBlock).to.equal(2000);
      });
  
      it("Should revert when trying to extend the expiry by a non-attestor", async function () {
        await expect(otc.connect(owner).extendExpiry(0, 2000)).to.be.revertedWith("Only the attestor can extend the expiry");
      });
  
      it("Should revert when trying to extend the expiry for an invalid deal ID", async function () {
        await expect(otc.connect(addr1).extendExpiry(1, 2000)).to.be.revertedWith("Invalid deal ID");
      });
    });
  
    describe("Refund", function () {
      beforeEach(async function () {
        await otc.postOffer("bankruptcy claims", "FTX claim", 1000, ethers.parseEther("1"));
        await otc.connect(addr1).takeOffer(0, { value: ethers.parseEther("1") });
      });
  
      it("Should refund the deposits when the deal has expired", async function () {
        await ethers.provider.send("evm_increaseTime", [2000]); // Increase the time to simulate deal expiry
        await otc.refund(0);
  
        const deal = await otc.deals(0);
        expect(deal.status).to.equal(0);
        expect(deal.sellerDeposit).to.equal(0);
        expect(deal.buyerDeposit).to.equal(0);
        expect(await owner.getBalance()).to.equal(ethers.parseEther("1"));
        expect(await addr1.getBalance()).to.equal(ethers.parseEther("1"));
      });
  
      it("Should revert when trying to refund a deal that has not expired", async function () {
        await expect(otc.refund(0)).to.be.revertedWith("Deal has not expired yet");
      });
  
      it("Should revert when trying to refund an invalid deal ID", async function () {
        await expect(otc.refund(1)).to.be.revertedWith("Invalid deal ID");
      });
    });
  });
  