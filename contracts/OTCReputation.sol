pragma solidity ^0.8.0;

contract OTCReputation {
    struct Proposal {
        string proposalMsg;
        address initiator;
        address couterParty;
        address attestor;
        string status; //initiated,matched,executable,executed,expired
        uint deadlineBlock;

    }
    
    Proposal[] public proposals;
    address public admin;

    event proposalCreation(string proposalMsg,   address initiator, address counterParty, address attestor, string status,uint deadlineBlock, uint proposalIndex);
    event counterPartyMatched(string proposalMsg,   address initiator, address counterParty, address attestor, string status,uint deadlineBlock, uint proposalIndex);
    event attestorMatched(string proposalMsg,   address initiator, address counterParty, address attestor, string status,uint deadlineBlock, uint proposalIndex);
    event proposalExecuted(string proposalMsg,   address initiator, address counterParty, address attestor, string status,uint deadlineBlock, uint proposalIndex);
    event proposalExepired(string proposalMsg,   address initiator, address counterParty, address attestor, string status,uint deadlineBlock, uint proposalIndex);

    constructor() {
        admin = msg.sender;
    }

    function createProposal(string memory _proposalMsg, uint _deadlineBlock) public {

        uint256 proposalIndex = proposals.length; // Auto-increment the index
        Proposal memory newProposal;
        newProposal.initiator = msg.sender;
        newProposal.proposalMsg = _proposalMsg;
        newProposal.status = "initiated";
        newProposal.deadlineBlock = _deadlineBlock;

        proposals.push(newProposal);

        emit proposalCreation(newProposal.proposalMsg,newProposal.initiator, newProposal.couterParty, newProposal.attestor,  newProposal.status, newProposal.deadlineBlock, proposalIndex);
    }


    function matchProposal(uint _proposalIndex) public {

        proposals[_proposalIndex].status = "matched";
        proposals[_proposalIndex].couterParty = msg.sender;

        emit counterPartyMatched(proposals[_proposalIndex].proposalMsg,proposals[_proposalIndex].initiator, proposals[_proposalIndex].couterParty, proposals[_proposalIndex].attestor,  proposals[_proposalIndex].status, proposals[_proposalIndex].deadlineBlock, _proposalIndex);
    }

}
