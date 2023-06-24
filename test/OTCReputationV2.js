pragma solidity ^0.8.0;

import "../contracts/OTCReputationV2.sol";

contract TestOTC {
    OTC private otc;

    function beforeEach() public {
        otc = new OTC();
    }

    function testPostOffer() public {
        string memory dealType = "bankruptcy claims";
        string memory opportunityName = "FTX claim";
        uint256 expiryBlock = block.number + 100;
        uint256 sellerDeposit = 1000;

        otc.postOffer(dealType, opportunityName, expiryBlock, sellerDeposit);

        OTC.Deal[] memory deals = otc.deals();

        Assert.equal(deals.length, 1, "Unexpected number of deals");
        Assert.equal(deals[0].dealType, dealType, "Incorrect deal type");
        Assert.equal(deals[0].opportunityName, opportunityName, "Incorrect opportunity name");
        Assert.equal(deals[0].seller, address(this), "Incorrect seller address");
        Assert.equal(deals[0].sellerDeposit, sellerDeposit, "Incorrect seller deposit");
        Assert.equal(deals[0].expiryBlock, expiryBlock, "Incorrect expiry block");
    }

    function testTakeOffer() public {
        string memory dealType = "bankruptcy claims";
        string memory opportunityName = "FTX claim";
        uint256 expiryBlock = block.number + 100;
        uint256 sellerDeposit = 1000;

        otc.postOffer(dealType, opportunityName, expiryBlock, sellerDeposit);

        OTC.Deal[] memory deals = otc.deals();
        uint256 dealId = 0;

        otc.takeOffer(dealId, { value: 500 });

        Assert.equal(deals[dealId].buyer, address(this), "Incorrect buyer address");
        Assert.equal(deals[dealId].buyerDeposit, 500, "Incorrect buyer deposit");
        Assert.equal(deals[dealId].status, 1, "Incorrect deal status");
    }

    function testSettleTrade() public {
        string memory dealType = "bankruptcy claims";
        string memory opportunityName = "FTX claim";
        uint256 expiryBlock = block.number + 100;
        uint256 sellerDeposit = 1000;

        otc.postOffer(dealType, opportunityName, expiryBlock, sellerDeposit);

        OTC.Deal[] memory deals = otc.deals();
        uint256 dealId = 0;

        otc.takeOffer(dealId, { value: 500 });
        otc.settleTrade(dealId);

        Assert.equal(deals[dealId].status, 2, "Incorrect deal status");
    }

    function testSwapAttestor() public {
        string memory dealType = "bankruptcy claims";
        string memory opportunityName = "FTX claim";
        uint256 expiryBlock = block.number + 100;
        uint256 sellerDeposit = 1000;
        address newAttestor = address(0x123);

        otc.postOffer(dealType, opportunityName, expiryBlock, sellerDeposit);

        OTC.Deal[] memory deals = otc.deals();
        uint256 dealId = 0;

        otc.swapAttestor(dealId, newAttestor);

        Assert.equal(deals[dealId].attestor, newAttestor, "Incorrect attestor address");
    }

    function testExtendExpiry() public {
        string memory dealType = "bankruptcy claims";
        string memory opportunityName = "FTX claim";
       
