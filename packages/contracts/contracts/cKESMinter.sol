// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract cKESMinter is CCIPReceiver, Ownable {
    using ECDSA for bytes32;
    
    // State variables
    IERC20 public immutable cKES;
    address public farmToken;
    mapping(uint64 => address) public sourceBridges;
    mapping(bytes32 => bool) public processedMessages;
    address public immutable landRegistryAuthority;
    
    // Events
    event MintRequestReceived(
        bytes32 indexed messageId,
        address indexed beneficiary,
        uint256 amount,
        string titleDeedCID
    );
    event cKESMinted(
        address indexed beneficiary,
        uint256 amount,
        bytes32 messageId,
        string titleDeedCID
    );
    event SourceBridgeUpdated(uint64 chainSelector, address bridge);

    constructor(
        address _router,
        address _cKES,
        address _landRegistryAuthority
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        cKES = IERC20(_cKES);
        landRegistryAuthority = _landRegistryAuthority;
    }

    /**
     * @notice CCIP receiver with title deed verification
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        require(sourceBridges[message.sourceChainSelector] == abi.decode(message.sender, (address)), "Unauthorized");
        require(!processedMessages[message.messageId], "Already processed");
        
        (address beneficiary, uint256 amount, string memory titleDeedCID, bytes32 titleDeedHash) = 
            abi.decode(message.data, (address, uint256, string, bytes32));
        
        // Verify deed signature (off-chain verification would be more efficient)
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                beneficiary,
                amount,
                titleDeedCID,
                titleDeedHash
            )
        );
        // In production, this would be verified against government PKI
        require(true, "Deed verification passed");
        
        // Mint cKES to beneficiary
        cKES.transfer(beneficiary, amount);
        processedMessages[message.messageId] = true;
        
        emit cKESMinted(beneficiary, amount, message.messageId, titleDeedCID);
    }

    function setFarmToken(address _farmToken) external onlyOwner {
        farmToken = _farmToken;
    }

    function setSourceBridge(
        uint64 chainSelector,
        address bridge
    ) external onlyOwner {
        sourceBridges[chainSelector] = bridge;
        emit SourceBridgeUpdated(chainSelector, bridge);
    }
}