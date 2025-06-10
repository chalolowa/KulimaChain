// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Compliance {
    mapping(address => bool) private trustedContracts;
    
    modifier onlyTrusted() {
        require(trustedContracts[msg.sender], "Caller not trusted");
        _;
    }
    
    function canTransfer(
        address from,
        address to,
        uint256 /*id*/,
        uint256 /*amount*/
    ) external view onlyTrusted returns (bool) {
        // Basic compliance: Block transfers to zero address
        return to != address(0);
    }
    
    function addTrustedContract(address contractAddress) external {
        trustedContracts[contractAddress] = true;
    }
    
    function removeTrustedContract(address contractAddress) external {
        trustedContracts[contractAddress] = false;
    }
}