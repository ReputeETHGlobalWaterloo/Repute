pragma solidity ^0.8.0;

contract VotingContract {
    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    
    Proposal[] public proposals;
    
    constructor() {
        // Initialize some sample proposals
        proposals.push(Proposal(1, "Proposal 1", 0));
        proposals.push(Proposal(2, "Proposal 2", 0));
    }
    
    function addProposal(uint256 _id, string memory _name) public {
        Proposal memory newProposal = Proposal(_id, _name, 0);
        proposals.push(newProposal);
    }
    
    function vote(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposals.length, "Invalid proposal ID");
        proposals[_proposalId - 1].voteCount++;
    }
    
    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }
    
    function getProposal(uint256 _proposalId) public view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposals.length, "Invalid proposal ID");
        return proposals[_proposalId - 1];
    }
}
