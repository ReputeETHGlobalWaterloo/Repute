pragma solidity ^0.8.0;

contract OTC {
    struct Deal {
        string dealType; // bankruptcy claims, saft, safe, vesting tokens, airdrop
        string opportunityName; // i.e. FTX claim, MonkeySwap SAFT
        address seller;
        address buyer;
        address attestor; // assigned attestor. each attestor might have specializations in i.e. claims
        // attestor can be swapped by contract admin, if attestor can no longer serve the duty
        uint256 sellerDeposit; // in ETH, amount deposited by seller, which is the collateral amount
        uint256 buyerDeposit; // in ETH, amount deposited by buyer, which is the total payment amount
        uint256 status; // 0: available, 1: taken, 2: settled
        // deal is created, seller deposits, status = 0
        // buyer is interested, buyer deposits, status = 1
        // claim is issued off-chain, attestor verify off-chain settlement, status = 2
        uint256 expiryBlock; // if block.number > expiryBlock, can return deposits to respective depositors
        // attestor can extend deadlineBlock
    }

    Deal[] public deals;

    function postOffer(string memory _dealType, string memory _opportunityName, uint256 _expiryBlock, uint256 _sellerDeposit) external payable{
        Deal memory newDeal;
        require(msg.value >= _sellerDeposit);
        newDeal.dealType = _dealType;
        newDeal.opportunityName = _opportunityName;
        newDeal.seller = msg.sender;
        newDeal.status = 0;
        newDeal.sellerDeposit = _sellerDeposit;
        newDeal.expiryBlock = _expiryBlock;

        deals.push(newDeal);
    }

    function takeOffer(uint256 _dealId) external payable {
        require(_dealId < deals.length, "Invalid deal ID");
        Deal storage currentDeal = deals[_dealId];
        require(currentDeal.status == 0, "Deal not available");

        currentDeal.buyer = msg.sender;
        currentDeal.buyerDeposit = msg.value;
        currentDeal.status = 1;
    }

    function settleTrade(uint256 _dealId) external {
        require(_dealId < deals.length, "Invalid deal ID");
        Deal storage currentDeal = deals[_dealId];
        require(currentDeal.status == 1, "Deal not taken");

        // Perform off-chain claim verification and settlement

        // Assuming the verification is successful
        currentDeal.status = 2;
        payable(currentDeal.seller).transfer(currentDeal.sellerDeposit);
        payable(currentDeal.buyer).transfer(currentDeal.buyerDeposit);
        
    }

    function swapAttestor(uint256 _dealId, address _newAttestor) external {
        require(_dealId < deals.length, "Invalid deal ID");
        Deal storage currentDeal = deals[_dealId];

        // Only the contract admin can swap the attestor
        require(msg.sender == currentDeal.seller, "Only contract admin can swap the attestor");

        currentDeal.attestor = _newAttestor;
    }

    function extendExpiry(uint256 _dealId, uint256 _newExpiry) external {
        require(_dealId < deals.length, "Invalid deal ID");
        Deal storage currentDeal = deals[_dealId];

        // Only the attestor can extend the expiry
        require(msg.sender == currentDeal.attestor, "Only the attestor can extend the expiry");

        currentDeal.expiryBlock = _newExpiry;
    }

    function refund(uint256 _dealId) external {
        require(_dealId < deals.length, "Invalid deal ID");
        Deal storage currentDeal = deals[_dealId];

        // Check if the deal has expired
        require(block.number > currentDeal.expiryBlock, "Deal has not expired yet");

        // Reset the deal status
        currentDeal.status = 0;
        currentDeal.sellerDeposit = 0;
        currentDeal.buyerDeposit = 0;

        // Refund the deposits to respective depositors
        payable(currentDeal.seller).transfer(currentDeal.sellerDeposit);
        payable(currentDeal.buyer).transfer(currentDeal.buyerDeposit);

    }
}
