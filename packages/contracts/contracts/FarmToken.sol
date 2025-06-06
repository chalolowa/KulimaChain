// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@erc3643/contracts/ERC3643.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KulimaTokenManager.sol";

contract FarmToken is ERC3643, Ownable {
    KulimaTokenManager public tokenManager;

    struct Farm {
        string geoLocation;
        uint256 sizeHectares;
        uint256 valuation;
        string titleDeedCID;
        bytes32 titleDeedHash;
        address verifiedBy;
        uint256 verifiedAt;
    }

    // State variables
    mapping(uint256 => Farm) public farmDetails;
    AggregatorV3Interface internal landPriceFeed;
    KulimaTokenManager public tokenManager;
    uint256 public totalTokenizedFarms;
    address public landRegistryAuthority;
    
    // Events
    event FarmTokenized(
        uint256 indexed farmId,
        uint256 valuation,
        string titleDeedCID
    );
    event SharesTransferred(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 indexed farmId
    );

    constructor(
        address _compliance,
        address _landOracle,
        address _tokenManager,
        address _landRegistryAuthority
    ) ERC3643("Kulima Farm Shares", "KFS", _compliance) {
        landPriceFeed = AggregatorV3Interface(_landOracle);
        tokenManager = KulimaTokenManager(_tokenManager);
        landRegistryAuthority = _landRegistryAuthority;
    }

    /**
     * @notice Tokenizes farmland with title deed verification
     * @param geoLocation GPS coordinates of the farm
     * @param sizeHectares Size of the farm in hectares
     * @param initialSupply Initial token supply for the farm shares
     * @param titleDeedCID IPFS CID for the title deed document
     * @param titleDeedHash SHA-256 hash of the title deed document
     * @param authoritySignature Signature from land registry authority
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
        
        // Mint tokens using Token Manager
        _mint(address(tokenManager), initialSupply);
        
        emit FarmTokenized(farmId, valuation, titleDeedCID);
    }

    /**
     * @notice Transfer farm shares via Token Manager
     */
    function transferShares(
        address to,
        uint256 amount,
        uint256 farmId
    ) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        // Use Token Manager for compliant transfer
        tokenManager.transferFarmShares(
            msg.sender,
            to,
            amount
        );
        
        emit SharesTransferred(msg.sender, to, amount, farmId);
    }

    // Override with farming-specific transfer rules
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Additional restrictions can be added here
        if (from != address(0) { // Skip minting
            require(
                to != address(this),
                "Cannot transfer to contract address"
            );
        }
    }

    function updateTokenManager(address _tokenManager) external onlyOwner {
        tokenManager = KulimaTokenManager(_tokenManager);
    }

    function getLandValuation(uint256 sizeHectares) internal view returns (uint256) {
        (, int256 price, , , ) = landPriceFeed.latestRoundData();
        require(price > 0, "Invalid price data");
        return uint256(price) * sizeHectares;
    }
}