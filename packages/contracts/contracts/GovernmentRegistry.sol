// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GovernmentRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct GovernmentAuthority {
        string name;
        string jurisdiction;
        string apiEndpoint;
        bool isActive;
        uint256 addedAt;
        uint256 verificationCount;
    }

    struct DocumentProof {
        bytes32 titleDeedHash;
        bytes32 nationalIdHash;
        address verifiedBy;
        bool verified;
        uint256 verifiedAt;
        string notes; // Optional verification notes
    }
    
    mapping(address => GovernmentAuthority) public authorities;
    mapping(bytes32 => DocumentProof) public documentProofs;
    mapping(bytes32 => bool) public usedTitleDeeds;
    mapping(bytes32 => bool) public usedNationalIds;
    address[] public authorityAddresses;
    
    event AuthorityAdded(address indexed authority, string name, string jurisdiction);
    event AuthorityUpdated(address indexed authority, string newEndpoint);
    event AuthorityDeactivated(address indexed authority);
    event DocumentVerified(
        bytes32 indexed proofHash, 
        address indexed authority, 
        bytes32 titleDeedHash, 
        bytes32 nationalIdHash
    );
    event VerificationRevoked(bytes32 indexed proofHash, address indexed revokedBy);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function addAuthority(
        address authorityAddress,
        string memory name,
        string memory jurisdiction,
        string memory apiEndpoint
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(authorities[authorityAddress].addedAt == 0, "Authority already exists");
        
        authorities[authorityAddress] = GovernmentAuthority({
            name: name,
            jurisdiction: jurisdiction,
            apiEndpoint: apiEndpoint,
            isActive: true,
            addedAt: block.timestamp,
            verificationCount: 0
        });
        
        authorityAddresses.push(authorityAddress);
        _grantRole(VERIFIER_ROLE, authorityAddress);
        
        emit AuthorityAdded(authorityAddress, name, jurisdiction);
    }

    function verifyDocuments(
        bytes32 proofHash,
        bytes32 titleDeedHash,
        bytes32 nationalIdHash,
        string memory notes
    ) external onlyRole(VERIFIER_ROLE) nonReentrant {
        require(authorities[msg.sender].isActive, "Authority inactive");
        require(proofHash != bytes32(0), "Invalid proof hash");
        require(titleDeedHash != bytes32(0), "Invalid title deed hash");
        require(nationalIdHash != bytes32(0), "Invalid national ID hash");
        require(!documentProofs[proofHash].verified, "Already verified");
        require(!usedTitleDeeds[titleDeedHash], "Title deed already used");
        require(!usedNationalIds[nationalIdHash], "National ID already used");
        
        documentProofs[proofHash] = DocumentProof({
            titleDeedHash: titleDeedHash,
            nationalIdHash: nationalIdHash,
            verifiedBy: msg.sender,
            verified: true,
            verifiedAt: block.timestamp,
            notes: notes
        });
        
        // Mark documents as used to prevent reuse
        usedTitleDeeds[titleDeedHash] = true;
        usedNationalIds[nationalIdHash] = true;
        
        authorities[msg.sender].verificationCount++;
        
        emit DocumentVerified(proofHash, msg.sender, titleDeedHash, nationalIdHash);
    }

    function revokeVerification(
        bytes32 proofHash, 
        string memory reason
    ) external onlyRole(VERIFIER_ROLE) {
        require(documentProofs[proofHash].verified, "Not verified");
        require(
            documentProofs[proofHash].verifiedBy == msg.sender || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
            "Not authorized to revoke"
        );
        
        DocumentProof storage proof = documentProofs[proofHash];
        
        // Free up the documents for potential re-verification
        usedTitleDeeds[proof.titleDeedHash] = false;
        usedNationalIds[proof.nationalIdHash] = false;
        
        proof.verified = false;
        proof.notes = reason;
        
        emit VerificationRevoked(proofHash, msg.sender);
    }
    
    function updateAuthorityEndpoint(
        address authorityAddress,
        string memory newEndpoint
    ) external onlyRole(VERIFIER_ROLE) {
        require(authorities[authorityAddress].isActive, "Authority inactive");
        authorities[authorityAddress].apiEndpoint = newEndpoint;
        emit AuthorityUpdated(authorityAddress, newEndpoint);
    }
    
    function deactivateAuthority(address authorityAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(authorities[authorityAddress].isActive, "Already inactive");
        authorities[authorityAddress].isActive = false;
        _revokeRole(VERIFIER_ROLE, authorityAddress);
        emit AuthorityDeactivated(authorityAddress);
    }
    
    function isVerifiedAuthority(address authorityAddress) external view returns (bool) {
        return authorities[authorityAddress].isActive && 
               hasRole(VERIFIER_ROLE, authorityAddress);
    }

    function isDocumentVerified(bytes32 proofHash) external view returns (bool) {
        return documentProofs[proofHash].verified;
    }

    function getDocumentProof(bytes32 proofHash) external view returns (
        bytes32 titleDeedHash,
        bytes32 nationalIdHash,
        address verifiedBy,
        bool verified,
        uint256 verifiedAt,
        string memory notes
    ) {
        DocumentProof storage proof = documentProofs[proofHash];
        return (
            proof.titleDeedHash,
            proof.nationalIdHash,
            proof.verifiedBy,
            proof.verified,
            proof.verifiedAt,
            proof.notes
        );
    }
    
    function getAllAuthorities() external view returns (address[] memory) {
        return authorityAddresses;
    }
    
    function getAuthorityInfo(address authorityAddress) external view returns (
        string memory name,
        string memory jurisdiction,
        string memory apiEndpoint,
        bool isActive,
        uint256 addedAt
    ) {
        GovernmentAuthority memory authority = authorities[authorityAddress];
        return (
            authority.name,
            authority.jurisdiction,
            authority.apiEndpoint,
            authority.isActive,
            authority.addedAt
        );
    }
    
    function getActiveAuthorities() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active authorities
        for (uint256 i = 0; i < authorityAddresses.length; i++) {
            if (authorities[authorityAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active authorities
        address[] memory activeAuthorities = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < authorityAddresses.length; i++) {
            if (authorities[authorityAddresses[i]].isActive) {
                activeAuthorities[index] = authorityAddresses[i];
                index++;
            }
        }
        
        return activeAuthorities;
    }

    function getTotalVerifications() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < authorityAddresses.length; i++) {
            total += authorities[authorityAddresses[i]].verificationCount;
        }
        return total;
    }
}