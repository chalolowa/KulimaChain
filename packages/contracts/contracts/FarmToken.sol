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

interface IGovernmentRegistry {
    function isVerifiedAuthority(address authority) external view returns (bool);
    function isDocumentVerified(bytes32 proofHash) external view returns (bool);
    function getDocumentProof(bytes32 proofHash) external view returns (
        bytes32 titleDeedHash,
        bytes32 nationalIdHash,
        address verifiedBy,
        bool verified,
        uint256 verifiedAt,
        string memory notes
    );
}

contract FarmToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {
    using ECDSA for bytes32;
    IRouterClient public i_router;
    IGovernmentRegistry public governmentRegistry;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct Farm {
        string geoLocation;
        uint256 sizeHectares;
        uint256 valuation;
        string titleDeedCID;
        bytes32 titleDeedHash;
        bytes32 nationalIdHash;
        bytes32 documentProofHash;
        address verifiedBy;
        uint256 verifiedAt;
        address owner;
        bool isFractionalized;
        bool isActive;
    }

    struct TokenizationData {
        address beneficiary;
        string geoLocation;
        uint256 sizeHectares;
        uint256 proposedValuation;
        string titleDeedCID;
        bytes32 documentProofHash;
        uint256 authorityValuation;
    }

    // Farm management
    uint256 public totalTokenizedFarms;
    mapping(uint256 => Farm) public farmDetails;
    mapping(bytes32 => bool) public usedTitleDeedHashes;
    mapping(bytes32 => bool) public usedDocumentProofs;
    mapping(uint256 => uint256) public proposedValuations;
    
    // Events
    event FarmTokenized(
        uint256 indexed farmId,
        address indexed beneficiary,
        uint256 valuation,
        string titleDeedCID,
        bytes32 indexed documentProofHash,
        address verifier
    );
    event Fractionalized(uint256 indexed farmId, address indexed owner);
    event FarmReclaimed(uint256 indexed farmId, address indexed owner);
    event GovernmentRegistryUpdated(address indexed newRegistry);
    event FarmPriceProposed(uint256 indexed farmId, uint256 proposedPrice);
    event FarmValuationUpdated(uint256 indexed farmId, uint256 newValuation, address indexed verifier);
    event FarmDeactivated(uint256 indexed farmId, string reason);

    constructor(
        address _initialOwner,
        address _governmentRegistry,
        string memory _uri
    )
        ERC1155(_uri)
    {
        require(_initialOwner != address(0), "Invalid owner");
        require(_governmentRegistry != address(0), "Invalid registry");
        
        governmentRegistry = IGovernmentRegistry(_governmentRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(MINTER_ROLE, _initialOwner);
    }

    /// @notice Tokenizes farmland with government authority verification
    function tokenizeFarmWithDeed(
        address beneficiary,
        string memory geoLocation,
        uint256 sizeHectares,
        uint256 proposedValuation,
        string memory titleDeedCID,
        bytes32 documentProofHash,
        bytes memory authoritySignature,
        uint256 authorityValuation
    ) external {
        TokenizationData memory data = TokenizationData({
            beneficiary: beneficiary,
            geoLocation: geoLocation,
            sizeHectares: sizeHectares,
            proposedValuation: proposedValuation,
            titleDeedCID: titleDeedCID,
            documentProofHash: documentProofHash,
            authorityValuation: authorityValuation
        });

        _validateTokenizationInputs(data);
        
        // Get document details and verify
        (bytes32 titleDeedHash, bytes32 nationalIdHash, address signer) = 
            _verifyDocumentAndAuthority(data, authoritySignature);
        
        // Create new farm NFT
        uint256 farmId = _createFarmToken(data, titleDeedHash, nationalIdHash, signer);
        
        emit FarmTokenized(farmId, data.beneficiary, data.authorityValuation, data.titleDeedCID, data.documentProofHash, signer);
    }

    function _validateTokenizationInputs(TokenizationData memory data) internal view {
        require(data.beneficiary != address(0), "Invalid beneficiary");
        require(data.sizeHectares > 0, "Invalid farm size");
        require(data.authorityValuation > 0, "Invalid valuation");
        require(data.documentProofHash != bytes32(0), "Invalid document proof");
        require(!usedDocumentProofs[data.documentProofHash], "Document proof already used");
        require(governmentRegistry.isDocumentVerified(data.documentProofHash), "Documents not verified");
    }

    function _verifyDocumentAndAuthority(
        TokenizationData memory data, 
        bytes memory authoritySignature
    ) internal view returns (bytes32 titleDeedHash, bytes32 nationalIdHash, address signer) {
        // Get document details from registry
        bool verified;
        (titleDeedHash, nationalIdHash, , verified, ,) = governmentRegistry.getDocumentProof(data.documentProofHash);
        
        require(verified, "Document verification revoked");
        require(!usedTitleDeedHashes[titleDeedHash], "Title deed already tokenized");
        
        // Verify authority signature for tokenization
        bytes32 messageHash = keccak256(abi.encodePacked(
            data.beneficiary,
            data.geoLocation,
            data.sizeHectares,
            data.titleDeedCID,
            data.documentProofHash,
            data.proposedValuation,
            data.authorityValuation,
            block.chainid
        ));
        
        signer = messageHash.toEthSignedMessageHash().recover(authoritySignature);
        require(governmentRegistry.isVerifiedAuthority(signer), "Invalid or inactive authority");
    }

    function _createFarmToken(
        TokenizationData memory data,
        bytes32 titleDeedHash,
        bytes32 nationalIdHash,
        address signer
    ) internal returns (uint256 farmId) {
        farmId = ++totalTokenizedFarms;
        usedTitleDeedHashes[titleDeedHash] = true;
        
        farmDetails[farmId] = Farm({
            geoLocation: data.geoLocation,
            sizeHectares: data.sizeHectares,
            valuation: data.authorityValuation,
            titleDeedCID: data.titleDeedCID,
            titleDeedHash: titleDeedHash,
            nationalIdHash: nationalIdHash,
            documentProofHash: data.documentProofHash,
            verifiedBy: signer,
            verifiedAt: block.timestamp,
            owner: data.beneficiary,
            isFractionalized: false,
            isActive: true
        });
        
        // Store proposed valuation for comparison
        if (data.proposedValuation != data.authorityValuation) {
            proposedValuations[farmId] = data.proposedValuation;
        }
        
        _mint(data.beneficiary, farmId, 1, "");
    }


    /// @notice Updates farm valuation with authority verification
    function updateFarmValuation(
        uint256 farmId,
        uint256 newValuation,
        bytes memory authoritySignature
    ) external {
        require(farmDetails[farmId].isActive, "Farm not active");
        require(newValuation > 0, "Invalid valuation");

        // Verify document is still valid in registry
        require(governmentRegistry.isDocumentVerified(farmDetails[farmId].documentProofHash), 
                "Document verification revoked");
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            farmId,
            newValuation,
            block.timestamp,
            block.chainid
        ));
        
        address signer = messageHash.toEthSignedMessageHash().recover(authoritySignature);
        require(governmentRegistry.isVerifiedAuthority(signer), "Invalid authority");
        
        farmDetails[farmId].valuation = newValuation;
        farmDetails[farmId].verifiedBy = signer;
        farmDetails[farmId].verifiedAt = block.timestamp;
        
        emit FarmValuationUpdated(farmId, newValuation, signer);
    }

    /// @notice Mark farm as fractionalized (can be split into shares)
    function markAsFractionalized(uint256 farmId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(farmDetails[farmId].isActive, "Farm not active");
        require(!farmDetails[farmId].isFractionalized, "Already fractionalized");
        farmDetails[farmId].isFractionalized = true;
        emit Fractionalized(farmId, farmDetails[farmId].owner);
    }

    /// @notice Reclaim a fractionalized farm
    function reclaimFarm(uint256 farmId) external {
        require(farmDetails[farmId].owner == msg.sender, "Not farm owner");
        require(farmDetails[farmId].isFractionalized, "Not fractionalized");
        require(balanceOf(msg.sender, farmId) == 1, "Must own full farm token");
        farmDetails[farmId].isFractionalized = false;
        emit FarmReclaimed(farmId, msg.sender);
    }

    /// @notice Allows farmers to propose new valuation
    function proposeFarmPrice(uint256 farmId, uint256 proposedPrice) external {
        require(balanceOf(msg.sender, farmId) > 0, "No farm ownership");
        require(farmDetails[farmId].isActive, "Farm not active");
        require(proposedPrice > 0, "Invalid price");
        
        proposedValuations[farmId] = proposedPrice;
        emit FarmPriceProposed(farmId, proposedPrice);
    }

    /// @notice Deactivate a farm (e.g., due to disputes or legal issues)
    function deactivateFarm(uint256 farmId, string memory reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(farmDetails[farmId].isActive, "Already inactive");
        
        farmDetails[farmId].isActive = false;
        emit FarmDeactivated(farmId, reason);
    }

    /// @notice Update the government registry contract
    function setGovernmentRegistry(address _registry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_registry != address(0), "Invalid registry");
        governmentRegistry = IGovernmentRegistry(_registry);
        emit GovernmentRegistryUpdated(_registry);
    }

    /// @notice Get basic farm information
    function getFarmDetails(uint256 farmId) external view returns (
        string memory location,
        uint256 sizeHectares,
        uint256 currentValuation,
        string memory titleDeedCID,
        address owner,
        bool isActive
    ) {
        Farm storage farm = farmDetails[farmId];
        return (
            farm.geoLocation,
            farm.sizeHectares,
            farm.valuation,
            farm.titleDeedCID,
            farm.owner,
            farm.isActive
        );
    }

    /// @notice Get farm verification details
    function getFarmVerification(uint256 farmId) external view returns (
        address verifiedBy,
        uint256 verifiedAt,
        uint256 proposedValuation,
        bool isFractionalized,
        bytes32 documentProofHash
    ) {
        Farm storage farm = farmDetails[farmId];
        return (
            farm.verifiedBy,
            farm.verifiedAt,
            proposedValuations[farmId],
            farm.isFractionalized,
            farm.documentProofHash
        );
    }

    /// @notice Verify farm documents are still valid in registry
    function verifyFarmDocuments(uint256 farmId) external view returns (
        bool isDocumentVerified,
        bool isAuthorityActive,
        string memory verificationNotes
    ) {
        Farm storage farm = farmDetails[farmId];
        
        isDocumentVerified = governmentRegistry.isDocumentVerified(farm.documentProofHash);
        isAuthorityActive = governmentRegistry.isVerifiedAuthority(farm.verifiedBy);
        
        if (isDocumentVerified) {
            (, , , , , verificationNotes) = governmentRegistry.getDocumentProof(farm.documentProofHash);
        }
        
        return (isDocumentVerified, isAuthorityActive, verificationNotes);
    }

    /// @notice Get farms owned by an address (paginated to avoid gas limits)
    function getFarmsByOwner(address owner, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory farmIds, uint256 total) 
    {
        // First count total owned farms
        uint256 totalOwned = 0;
        for (uint256 i = 1; i <= totalTokenizedFarms; i++) {
            if (balanceOf(owner, i) > 0) {
                totalOwned++;
            }
        }
        
        // Calculate actual limit
        uint256 actualLimit = limit;
        if (offset >= totalOwned) {
            return (new uint256[](0), totalOwned);
        }
        if (offset + limit > totalOwned) {
            actualLimit = totalOwned - offset;
        }
        
        // Collect farm IDs with pagination
        uint256[] memory result = new uint256[](actualLimit);
        uint256 found = 0;
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i <= totalTokenizedFarms && resultIndex < actualLimit; i++) {
            if (balanceOf(owner, i) > 0) {
                if (found >= offset) {
                    result[resultIndex] = i;
                    resultIndex++;
                }
                found++;
            }
        }
        
        return (result, totalOwned);
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

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
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