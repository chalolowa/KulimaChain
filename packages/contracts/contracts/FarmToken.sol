// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

contract FarmToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {
    using ECDSA for bytes32;
    IRouterClient public i_router;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct Farm {
        string geoLocation;
        uint256 sizeHectares;
        uint256 valuation;
        string titleDeedCID;
        bytes32 titleDeedHash;
        address verifiedBy;
        uint256 verifiedAt;
        address owner;
        bool isFractionalized;
    }

    // Farm management
    uint256 public totalTokenizedFarms;
    mapping(uint256 => Farm) public farmDetails;
    mapping(bytes32 => bool) public usedTitleDeedHashes;
    address public landRegistryAuthority;
    
    // Events
    event FarmTokenized(
        uint256 indexed farmId,
        address indexed beneficiary,
        uint256 valuation,
        string titleDeedCID
    );
    event Fractionalized(uint256 indexed farmId, address indexed owner);
    event FarmReclaimed(uint256 indexed farmId, address indexed owner);
    event LandRegistryUpdated(address newAuthority);
    event FarmPriceProposed(uint256 indexed farmId, uint256 proposedPrice);

    constructor(
        address _initialOwner,
        address _landRegistryAuthority
    )
        ERC1155("")
    {
        landRegistryAuthority = _landRegistryAuthority;
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(MINTER_ROLE, _initialOwner);
    }

    /// @notice Tokenizes farmland with authority verification
    function tokenizeFarmWithDeed(
        address beneficiary,
        string memory geoLocation,
        uint256 sizeHectares,
        uint256 proposedValuation,
        string memory titleDeedCID,
        bytes32 titleDeedHash,
        bytes memory authoritySignature,
        uint256 authorityValuation
    ) external {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(!usedTitleDeedHashes[titleDeedHash], "Title deed already used");
        
        // Verify authority signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            beneficiary,
            geoLocation,
            sizeHectares,
            titleDeedCID,
            titleDeedHash,
            proposedValuation,
            authorityValuation
        ));
        
        address signer = messageHash.toEthSignedMessageHash().recover(authoritySignature);
        require(signer == landRegistryAuthority, "Invalid authority signature");
        
        // Create new farm
        uint256 farmId = ++totalTokenizedFarms;
        usedTitleDeedHashes[titleDeedHash] = true;
        
        farmDetails[farmId] = Farm({
            geoLocation: geoLocation,
            sizeHectares: sizeHectares,
            valuation: authorityValuation,
            titleDeedCID: titleDeedCID,
            titleDeedHash: titleDeedHash,
            verifiedBy: signer,
            verifiedAt: block.timestamp,
            owner: beneficiary,
            isFractionalized: false
        });
        
        _mint(beneficiary, farmId, 1, "");
        emit FarmTokenized(farmId, beneficiary, authorityValuation, titleDeedCID);
    }

    function markAsFractionalized(uint256 farmId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!farmDetails[farmId].isFractionalized, "Already fractionalized");
        farmDetails[farmId].isFractionalized = true;
        emit Fractionalized(farmId, farmDetails[farmId].owner);
    }

    function reclaimFarm(uint256 farmId) external {
        require(farmDetails[farmId].owner == msg.sender, "Not farm owner");
        require(farmDetails[farmId].isFractionalized, "Not fractionalized");
        farmDetails[farmId].isFractionalized = false;
        emit FarmReclaimed(farmId, msg.sender);
    }

    /// @notice Allows farmers to propose new valuation
    function proposeFarmPrice(uint256 farmId, uint256 proposedPrice) external {
        require(balanceOf(msg.sender, farmId) > 0, "No farm ownership");
        emit FarmPriceProposed(farmId, proposedPrice);
    }

    function setLandRegistryAuthority(address _authority) external onlyRole(DEFAULT_ADMIN_ROLE) {
        landRegistryAuthority = _authority;
        emit LandRegistryUpdated(_authority);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data)
        external onlyRole(MINTER_ROLE)
    {
        _mint(to, id, amount, data);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    // Supports interfaces for ERC1155 and AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}