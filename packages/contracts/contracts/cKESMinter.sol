// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "./IcKES.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract cKESMinter is CCIPReceiver, Ownable {
    // State variables
    IcKES public immutable cKES;
    mapping(uint64 => address) public sourceBridges;
    mapping(bytes32 => bool) public processedMessages;
    
    // Events
    event cKESMinted(address indexed beneficiary, uint256 amount, bytes32 messageId);
    event cKESBurned(address indexed holder, uint256 amount, bytes32 messageId);
    event SourceBridgeUpdated(uint64 chainSelector, address bridge);

    constructor(address _router, address _cKES)
        CCIPReceiver(_router) Ownable(msg.sender) 
    {
        cKES = IcKES(_cKES);
    }

    /**
     * @notice CCIP receiver for mint/burn requests
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        require(sourceBridges[message.sourceChainSelector] == abi.decode(message.sender, (address)), "Unauthorized");
        require(!processedMessages[message.messageId], "Already processed");
        
        (bytes32 action, address beneficiary, uint256 amount) = 
            abi.decode(message.data, (bytes32, address, uint256));
        
        if (action == keccak256("MINT")) {
            cKES.mint(beneficiary, amount);
            emit cKESMinted(beneficiary, amount, message.messageId);
        } 
        else if (action == keccak256("BURN")) {
            cKES.burn(beneficiary, amount);
            emit cKESBurned(beneficiary, amount, message.messageId);
        }
        
        processedMessages[message.messageId] = true;
    }

    function setSourceBridge(uint64 chainSelector, address bridge) external onlyOwner {
        sourceBridges[chainSelector] = bridge;
        emit SourceBridgeUpdated(chainSelector, bridge);
    }
}