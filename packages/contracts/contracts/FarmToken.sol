// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "./IAKSStablecoin.sol";

interface ICompliance {
    function canTransfer(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) external view returns (bool);
}

contract FarmToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply, CCIPReceiver {
    using ECDSA for bytes32;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    
    struct Farm {
        string geoLocation;
        uint256 sizeHectares;
        uint256 valuation;
        string titleDeedCID;
        bytes32 titleDeedHash;
        address verifiedBy;
        uint256 verifiedAt;
        address owner;
        uint256 supply;
    }

    // Farm management
    uint256 public totalTokenizedFarms;
    mapping(uint256 => Farm) public farmDetails;
    mapping(bytes32 => bool) public usedTitleDeedHashes;
    address public landRegistryAuthority;
    
    // Compliance & Stablecoin
    ICompliance public compliance;
    IAKSStablecoin public aksStablecoin;
    
    // Cross-chain
    mapping(uint64 => address) public chainIdToContract;
    mapping(bytes32 => bool) public processedMessages;
    uint64 public currentChainId;
    
    // Events
    event FarmTokenized(
        uint256 indexed farmId,
        address indexed beneficiary,
        uint256 valuation,
        uint256 initialSupply,
        string titleDeedCID
    );
    event ComplianceUpdated(address newCompliance);
    LandRegistryUpdated(address newAuthority);
    event CrossChainTransfer(
        uint256 indexed farmId,
        uint256 amount,
        address from,
        uint64 fromChain,
        address to,
        uint64 toChain
    );
    event FarmPriceProposed(
        uint256 indexed farmId,
        uint256 proposedPrice
    );

    constructor(
        address _initialOwner,
        address _landRegistryAuthority,
        address _compliance,
        address _aksStablecoin,
        address _ccipRouter,
        uint64 _currentChainId
    )
        ERC1155("")
        CCIPReceiver(_ccipRouter)
    {
        landRegistryAuthority = _landRegistryAuthority;
        compliance = ICompliance(_compliance);
        aksStablecoin = IAKSStablecoin(_aksStablecoin);
        currentChainId = _currentChainId;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(MINTER_ROLE, _initialOwner);
        _grantRole(BRIDGE_ROLE, address(this));
    }

    /// @notice Tokenizes farmland with authority verification
    function tokenizeFarmWithDeed(
        address beneficiary,
        string memory geoLocation,
        uint256 sizeHectares,
        uint256 proposedValuation,
        uint256 initialSupply,
        string memory titleDeedCID,
        bytes32 titleDeedHash,
        bytes memory authoritySignature,
        uint256 authorityValuation
    ) external whenNotPaused {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(initialSupply > 0, "Invalid supply");
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
            supply: initialSupply
        });
        
        _mint(beneficiary, farmId, initialSupply, "");
        emit FarmTokenized(farmId, beneficiary, authorityValuation, initialSupply, titleDeedCID);
    }

    /// @notice Allows farmers to propose new valuation
    function proposeFarmPrice(uint256 farmId, uint256 proposedPrice) external {
        require(balanceOf(msg.sender, farmId) > 0, "No farm ownership");
        emit FarmPriceProposed(farmId, proposedPrice);
    }

    /// @notice Cross-chain transfer using CCIP
    function transferCrossChain(
        uint64 destinationChainId,
        address receiver,
        uint256 farmId,
        uint256 amount,
        bytes memory data
    ) external payable whenNotPaused {
        require(balanceOf(msg.sender, farmId) >= amount, "Insufficient balance");
        require(chainIdToContract[destinationChainId] != address(0), "Unsupported chain");
        
        // Burn tokens from sender
        _burn(msg.sender, farmId, amount);
        
        // Build CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(chainIdToContract[destinationChainId]),
            data: abi.encode(msg.sender, receiver, farmId, amount, data),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });
        
        // Send message
        uint256 fee = IRouterClient(i_router).getFee(destinationChainId, message);
        require(msg.value >= fee, "Insufficient fee");
        
        bytes32 messageId = IRouterClient(i_router).ccipSend{value: fee}(
            destinationChainId,
            message
        );
        
        emit CrossChainTransfer(
            farmId,
            amount,
            msg.sender,
            currentChainId,
            receiver,
            destinationChainId
        );
    }

    /// @notice Handle incoming CCIP messages
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        require(processedMessages[message.messageId] == false, "Message already processed");
        processedMessages[message.messageId] = true;
        
        (address from, address to, uint256 farmId, uint256 amount, bytes memory data) = 
            abi.decode(message.data, (address, address, uint256, uint256, bytes));
        
        // Mint tokens on destination chain
        _mint(to, farmId, amount, data);
        
        emit CrossChainTransfer(
            farmId,
            amount,
            from,
            message.sourceChainId,
            to,
            currentChainId
        );
    }

    // Compliance enforcement
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        // Compliance check for transfers (not mints/burns)
        if (from != address(0) && to != address(0) && address(compliance) != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(compliance.canTransfer(from, to, ids[i], values[i]), "Transfer not compliant");
            }
        }
        
        super._update(from, to, ids, values);
    }

    // Administration functions
    function setCompliance(address _compliance) external onlyRole(DEFAULT_ADMIN_ROLE) {
        compliance = ICompliance(_compliance);
        emit ComplianceUpdated(_compliance);
    }

    function setLandRegistryAuthority(address _authority) external onlyRole(DEFAULT_ADMIN_ROLE) {
        landRegistryAuthority = _authority;
        emit LandRegistryUpdated(_authority);
    }

    function setChainContract(uint64 chainId, address contractAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        chainIdToContract[chainId] = contractAddress;
    }

    function setAKSStablecoin(address _aksStablecoin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        aksStablecoin = IAKSStablecoin(_aksStablecoin);
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