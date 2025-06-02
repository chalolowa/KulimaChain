// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@erc3643/contracts/ERC3643.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract FarmToken is ERC3643, CCIPReceiver, Ownable {
    using ECDSA for bytes32;
    
    struct Farm {
        string geoLocation;
        uint256 sizeHectares;
        uint256 valuation;
        string titleDeedCID; // IPFS CID for title deed
        bytes32 titleDeedHash; // SHA-256 hash of deed document
        address verifiedBy; // Government authority that verified
        uint256 verifiedAt;
    }

    // State variables
    mapping(uint256 => Farm) public farmDetails;
    AggregatorV3Interface internal landPriceFeed;
    uint256 public totalTokenizedFarms;
    address public landRegistryAuthority;
    
    // CCIP Integration
    IERC20 public immutable cKES;
    mapping(uint64 => address) public destinationBridges;
    mapping(bytes32 => bool) public completedMints;
    uint64 public constant DESTINATION_CHAIN_SELECTOR = 14767482510784806043; // Avalanche Fuji
    
    // Events
    event FarmTokenized(
        uint256 indexed farmId,
        uint256 valuation,
        string titleDeedCID
    );
    event FarmVerified(
        uint256 indexed farmId,
        address verifier,
        bytes32 deedHash
    );
    event TitleDeedUpdated(
        uint256 indexed farmId,
        string newCID,
        bytes32 newHash
    );
    event CrossChainMintInitiated(
        uint256 farmId,
        uint256 tokenAmount,
        address beneficiary,
        bytes32 messageId
    );
    event CrossChainMintCompleted(
        address beneficiary,
        uint256 tokenAmount,
        bytes32 messageId
    );
    event DestinationBridgeUpdated(uint64 chainSelector, address bridge);

    constructor(
        address _router,
        address _compliance,
        address _landOracle,
        address _cKES,
        address _landRegistryAuthority
    ) ERC3643("Kulima Farm Shares", "KFS", _compliance) CCIPReceiver(_router) {
        landPriceFeed = AggregatorV3Interface(_landOracle);
        cKES = IERC20(_cKES);
        landRegistryAuthority = _landRegistryAuthority;
    }

    /**
     * @notice Tokenizes farmland with title deed verification
     */
    function tokenizeFarmWithDeed(
        string memory geoLocation,
        uint256 sizeHectares,
        uint256 initialSupply,
        string memory titleDeedCID,
        bytes32 titleDeedHash,
        bytes memory authoritySignature
    ) external onlyOwner {
        // Verify government authority signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                geoLocation,
                sizeHectares,
                titleDeedCID,
                titleDeedHash
            )
        );
        address signer = messageHash.toEthSignedMessageHash().recover(authoritySignature);
        require(signer == landRegistryAuthority, "Invalid authority signature");
        
        uint256 valuation = getLandValuation(sizeHectares);
        uint256 farmId = totalTokenizedFarms++;
        
        farmDetails[farmId] = Farm({
            geoLocation: geoLocation,
            sizeHectares: sizeHectares,
            valuation: valuation,
            titleDeedCID: titleDeedCID,
            titleDeedHash: titleDeedHash,
            verifiedBy: signer,
            verifiedAt: block.timestamp
        });
        
        // Mint tokens
        _mint(address(this), initialSupply);
        
        emit FarmTokenized(farmId, valuation, titleDeedCID);
    }

    /**
     * @notice Updates title deed (only for corrections)
     */
    function updateTitleDeed(
        uint256 farmId,
        string memory newTitleDeedCID,
        bytes32 newTitleDeedHash,
        bytes memory authoritySignature
    ) external onlyOwner {
        Farm storage farm = farmDetails[farmId];
        
        // Verify government authority signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                farm.geoLocation,
                farm.sizeHectares,
                newTitleDeedCID,
                newTitleDeedHash
            )
        );
        address signer = messageHash.toEthSignedMessageHash().recover(authoritySignature);
        require(signer == landRegistryAuthority, "Invalid authority signature");
        
        farm.titleDeedCID = newTitleDeedCID;
        farm.titleDeedHash = newTitleDeedHash;
        farm.verifiedBy = signer;
        farm.verifiedAt = block.timestamp;
        
        emit TitleDeedUpdated(farmId, newTitleDeedCID, newTitleDeedHash);
    }

    /**
     * @notice Cross-chain tokenization with title deed
     */
    function tokenizeFarmWithMint(
        string memory geoLocation,
        uint256 sizeHectares,
        uint256 initialSupply,
        address beneficiary,
        uint64 destinationChain,
        string memory titleDeedCID,
        bytes32 titleDeedHash,
        bytes memory authoritySignature
    ) external payable onlyOwner {
        // Verify deed with local authority
        tokenizeFarmWithDeed(
            geoLocation,
            sizeHectares,
            initialSupply,
            titleDeedCID,
            titleDeedHash,
            authoritySignature
        );
        
        uint256 farmId = totalTokenizedFarms - 1;
        uint256 valuation = farmDetails[farmId].valuation;
        uint256 mintCost = valuation * 1e12; // Convert to wei (cKES has 6 decimals)
        
        // Transfer cKES payment from beneficiary
        cKES.transferFrom(beneficiary, address(this), mintCost);
        
        // Build CCIP message with deed metadata
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationBridges[destinationChain]),
            data: abi.encode(beneficiary, initialSupply, titleDeedCID, titleDeedHash),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0) // Pay in native gas
        });
        
        IRouterClient router = IRouterClient(getRouter());
        uint256 fee = router.getFee(destinationChain, message);
        require(msg.value >= fee, "Insufficient CCIP fee");
        
        // Send message
        bytes32 messageId = router.ccipSend{value: fee}(
            destinationChain,
            message
        );
        
        emit CrossChainMintInitiated(
            farmId,
            initialSupply,
            beneficiary,
            messageId
        );
    }

    /**
     * @notice CCIP message receiver for cross-chain minting
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        require(message.sourceChainSelector == DESTINATION_CHAIN_SELECTOR, "Invalid source");
        require(!completedMints[message.messageId], "Mint already completed");
        
        (address beneficiary, uint256 amount, string memory titleDeedCID, bytes32 titleDeedHash) = 
            abi.decode(message.data, (address, uint256, string, bytes32));
        
        // Verify deed hash consistency
        require(
            keccak256(abi.encodePacked(titleDeedCID)) == 
            keccak256(abi.encodePacked(farmDetails[0].titleDeedCID), 
            "Deed mismatch"
        );
        
        // Mint tokens to beneficiary
        _mint(beneficiary, amount);
        completedMints[message.messageId] = true;
        
        emit CrossChainMintCompleted(beneficiary, amount, message.messageId);
    }

    /**
     * @notice Set destination bridge address for a chain
     */
    function setDestinationBridge(
        uint64 chainSelector,
        address bridge
    ) external onlyOwner {
        destinationBridges[chainSelector] = bridge;
        emit DestinationBridgeUpdated(chainSelector, bridge);
    }

    /**
     * @notice Fetches current land valuation from oracle
     * @param sizeHectares Farm size to calculate valuation
     */
    function getLandValuation(uint256 sizeHectares) public view returns (uint256) {
        (
            /* uint80 roundID */,
            int256 pricePerHectare,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = landPriceFeed.latestRoundData();
        
        require(pricePerHectare > 0, "Invalid oracle price");
        return sizeHectares * uint256(pricePerHectare);
    }

    // Override with farming-specific transfer rules
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        // Restrict transfers to only verified farms
        if (from != address(0)) { // Not minting
            require(farmDetails[amount].verified, "Farm not verified");
        }
    }

    function retryFailedMint(bytes32 messageId) external payable {
        require(!completedMints[messageId], "Already completed");
        require(failedMessages[messageId], "No failure recorded");
        
        Client.Any2EVMMessage memory message = getMessage(messageId);
        _ccipReceive(message);
    }
}