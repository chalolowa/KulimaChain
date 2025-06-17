// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@tokenysolutions/t-rex/contracts/registry/interface/IIdentityRegistry.sol";
import "@tokenysolutions/t-rex/contracts/registry/interface/ITrustedIssuersRegistry.sol";
import "@tokenysolutions/t-rex/contracts/registry/interface/IClaimTopicsRegistry.sol";
import "@tokenysolutions/t-rex/contracts/compliance/legacy/ICompliance.sol";
import "./IAKSStablecoin.sol";
import "./ITokensBridge.sol";
import "./IKFShares.sol";  // Interface for KFShares contract

contract FractionalizationProxy is AccessControl, CCIPReceiver {
    using ECDSA for bytes32;
    IRouterClient public i_router;
    IIdentityRegistry public identityRegistry;
    ITrustedIssuersRegistry public trustedIssuersRegistry;
    IClaimTopicsRegistry public claimTopicsRegistry;
    ICompliance public compliance;
    
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    struct FractionalizedFarm {
        address farmTokenContract;
        uint256 farmTokenId;
        address kfsToken;
        uint256 totalArea;         // Total area in square meters
        uint256 totalShares;
        uint256 communityShares;
        address originalOwner;
        bool active;
    }
    
    struct BuybackIntent {
        address initiator;
        uint256 pricePerShare;
        uint256 deadline;
        uint256 depositedAKS;
        bool active;
    }
    
    // Farm management
    mapping(uint256 => FractionalizedFarm) public fractionalizedFarms;
    mapping(address => mapping(uint256 => bool)) public isFractionalized;
    mapping(uint256 => BuybackIntent) public buybackIntents;
    
    // Token contracts
    IAKSStablecoin public aksToken;
    ITokensBridge public tokensBridge;
    address public kfsImplementation;
    address public communityVault;
    
    // Government authority
    address public landRegistryAuthority;
    
    // Lock control
    uint256 public constant LOCK_DURATION = 365 days * 10; // 10-year lock
    mapping(uint256 => uint256) public lockExpiry;
    
    // Events
    event FarmFractionalized(
        uint256 indexed farmTokenId,
        address indexed owner,
        address kfsToken,
        uint256 totalArea,
        uint256 totalShares
    );
    event BuybackIntentCreated(
        uint256 indexed farmTokenId,
        address indexed initiator,
        uint256 pricePerShare,
        uint256 deadline
    );
    event SharesBoughtBack(
        uint256 indexed farmTokenId,
        address indexed seller,
        uint256 amount,
        uint256 area,
        uint256 aksReceived
    );
    event BuybackCompleted(uint256 indexed farmTokenId, address indexed initiator);
    event BuybackCanceled(uint256 indexed farmTokenId, address indexed initiator);
    event CrossChainTransfer(
        uint256 indexed farmTokenId,
        address indexed investor,
        uint256 amount,
        uint64 sourceChain,
        uint64 destChain
    );

    constructor(
        address _admin,
        address _landRegistryAuthority,
        address _aksToken,
        address _tokensBridge,
        address _kfsImplementation,
        address _communityVault,
        address _ccipRouter
    ) CCIPReceiver(_ccipRouter) {
        landRegistryAuthority = _landRegistryAuthority;
        aksToken = IAKSStablecoin(_aksToken);
        tokensBridge = ITokensBridge(_tokensBridge);
        kfsImplementation = _kfsImplementation;
        communityVault = _communityVault;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GOVERNANCE_ROLE, _admin);
    }

    /// @notice Fractionalize a farm token into KFS shares
    function fractionalizeFarm(
        address farmTokenContract,
        uint256 farmTokenId,
        string memory name,
        string memory symbol,
        uint256 totalArea,
        uint256 sharesPerUnit // Shares per square meter
    ) external {
        require(totalArea > 0, "Invalid area");
        require(sharesPerUnit > 0, "Invalid shares");
        require(!isFractionalized[farmTokenContract][farmTokenId], "Already fractionalized");
        
        // Transfer farm token to proxy
        ERC1155(farmTokenContract).safeTransferFrom(
            msg.sender,
            address(this),
            farmTokenId,
            1,
            ""
        );
        
        // Calculate shares based on area
        uint256 totalShares = totalArea * sharesPerUnit;
        
        // Create KFS token
        address kfsToken = _createKFShares(name, symbol, totalShares);
        
        // Record fractionalization
        fractionalizedFarms[farmTokenId] = FractionalizedFarm({
            farmTokenContract: farmTokenContract,
            farmTokenId: farmTokenId,
            kfsToken: kfsToken,
            totalArea: totalArea,
            totalShares: totalShares,
            communityShares: totalShares * 10 / 100, // 10% locked
            originalOwner: msg.sender,
            active: true
        });
        
        isFractionalized[farmTokenContract][farmTokenId] = true;
        lockExpiry[farmTokenId] = block.timestamp + LOCK_DURATION;
        
        // Mint shares (90% to owner, 10% to community vault)
        IKFShares(kfsToken).mint(msg.sender, totalShares * 90 / 100);
        IKFShares(kfsToken).mint(communityVault, totalShares * 10 / 100);
        IKFShares(kfsToken).lockShares(communityVault, totalShares * 10 / 100);
        
        emit FarmFractionalized(farmTokenId, msg.sender, kfsToken, totalArea, totalShares);
    }

    /// @notice Create buyback intent for fractionalized farm
    function createBuybackIntent(
        uint256 farmTokenId,
        uint256 pricePerShare
    ) external {
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        require(farm.active, "Farm not active");
        require(farm.originalOwner == msg.sender, "Not original owner");
        require(!buybackIntents[farmTokenId].active, "Intent active");
        
        uint256 transferableShares = farm.totalShares - farm.communityShares;
        uint256 totalBuybackAmount = transferableShares * pricePerShare;
        
        // Transfer AKS tokens to proxy
        aksToken.transferFrom(msg.sender, address(this), totalBuybackAmount);
        
        // Create buyback intent
        buybackIntents[farmTokenId] = BuybackIntent({
            initiator: msg.sender,
            pricePerShare: pricePerShare,
            deadline: block.timestamp + 30 days,
            depositedAKS: totalBuybackAmount,
            active: true
        });
        
        emit BuybackIntentCreated(farmTokenId, msg.sender, pricePerShare, buybackIntents[farmTokenId].deadline);
    }

    /// @notice Sell shares back to original owner
    function sellToBuyback(
        uint256 farmTokenId,
        uint256 shares
    ) external {
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        BuybackIntent storage intent = buybackIntents[farmTokenId];
        IKFShares kfs = IKFShares(farm.kfsToken);
        
        require(farm.active, "Farm not active");
        require(intent.active, "No active intent");
        require(block.timestamp <= intent.deadline, "Intent expired");
        require(kfs.balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        // Calculate payment and area
        uint256 paymentAmount = shares * intent.pricePerShare;
        uint256 area = (shares * farm.totalArea) / farm.totalShares;
        require(paymentAmount <= intent.depositedAKS, "Insufficient funds");
        
        // Transfer and burn shares
        kfs.transferFrom(msg.sender, address(this), shares);
        kfs.burn(shares);
        
        // Transfer AKS payment to seller
        aksToken.transfer(msg.sender, paymentAmount);
        intent.depositedAKS -= paymentAmount;
        
        emit SharesBoughtBack(farmTokenId, msg.sender, shares, area, paymentAmount);
        
        // Check if buyback completed
        if (kfs.totalSupply() == farm.communityShares) {
            _completeBuyback(farmTokenId);
        }
    }

    /// @notice Purchase KFS shares with AKS
    function purchaseShares(
        uint256 farmTokenId,
        uint256 shares
    ) external {
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        IKFShares kfs = IKFShares(farm.kfsToken);
        uint256 area = (shares * farm.totalArea) / farm.totalShares;
        uint256 price = kfs.getCurrentPrice(shares);
        
        // Transfer AKS from investor
        aksToken.transferFrom(msg.sender, farm.originalOwner, price);
        
        // Mint new shares to investor
        kfs.mint(msg.sender, shares);
        
        emit SharesBoughtBack(farmTokenId, msg.sender, shares, area, price);
    }

    /// @notice Transfer KFS shares cross-chain
    function transferSharesCrossChain(
        uint64 destinationChainSelector,
        address receiver,
        uint256 farmTokenId,
        uint256 shares
    ) external payable {
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        IKFShares kfs = IKFShares(farm.kfsToken);
        
        require(kfs.balanceOf(msg.sender) >= shares, "Insufficient shares");
        
        // Lock shares on source chain
        kfs.transferFrom(msg.sender, address(this), shares);
        kfs.lockShares(address(this), shares);
        
        // Build CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(msg.sender, farmTokenId, shares),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });
        
        // Send message
        uint256 fee = IRouterClient(i_router).getFee(destinationChainSelector, message);
        require(msg.value >= fee, "Insufficient fee");
        
        bytes32 messageId = IRouterClient(i_router).ccipSend{value: fee}(
            destinationChainSelector,
            message
        );
        
        emit CrossChainTransfer(
            farmTokenId,
            msg.sender,
            shares,
            uint64(block.chainid),
            destinationChainSelector
        );
    }

    /// @notice Handle incoming CCIP messages for KFS shares
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        (address investor, uint256 farmTokenId, uint256 shares) = 
            abi.decode(message.data, (address, uint256, uint256));
        
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        IKFShares kfs = IKFShares(farm.kfsToken);
        
        // Mint equivalent shares on destination chain
        kfs.mint(investor, shares);
        
        emit CrossChainTransfer(
            farmTokenId,
            investor,
            shares,
            message.sourceChainId,
            block.chainid
        );
    }

    // ================= INTERNAL FUNCTIONS ================== //
    
    function _createKFShares(
        string memory name,
        string memory symbol,
        uint256 totalShares
    ) internal returns (address) {
        address clone = createClone(kfsImplementation);
        IKFShares(clone).initialize(
            name,
            symbol,
            totalShares,
            address(aksToken),
            address(tokensBridge),
            address(this)
        );
        return clone;
    }
    
    function _completeBuyback(uint256 farmTokenId) internal {
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        BuybackIntent storage intent = buybackIntents[farmTokenId];
        IKFShares kfs = IKFShares(farm.kfsToken);
        
        // Force burn community shares
        kfs.forceBurn(communityVault, farm.communityShares);
        
        // Transfer farm token back to original owner
        ERC1155(farm.farmTokenContract).safeTransferFrom(
            address(this),
            intent.initiator,
            farm.farmTokenId,
            1,
            ""
        );
        
        // Clean up state
        farm.active = false;
        delete buybackIntents[farmTokenId];
        
        emit BuybackCompleted(farmTokenId, intent.initiator);
    }
    
    function createClone(address target) internal returns (address result) {
        // Minimal proxy implementation
    }
    
    // ================= ADMIN FUNCTIONS ================== //
    
    function unlockCommunityShares(uint256 farmTokenId) external onlyRole(GOVERNANCE_ROLE) {
        require(block.timestamp >= lockExpiry[farmTokenId], "Lock active");
        FractionalizedFarm storage farm = fractionalizedFarms[farmTokenId];
        IKFShares(farm.kfsToken).unlockShares(communityVault);
    }

    function setLandRegistryAuthority(address _authority) external onlyRole(GOVERNANCE_ROLE) {
        landRegistryAuthority = _authority;
    }
    
    function setCommunityVault(address _vault) external onlyRole(GOVERNANCE_ROLE) {
        communityVault = _vault;
    }

    function setAKSToken(address _aksToken) external onlyRole(GOVERNANCE_ROLE) {
        aksToken = IAKSStablecoin(_aksToken);
    }

    function setTokenManager(address _manager) external onlyRole(GOVERNANCE_ROLE) {
        tokenManager = _manager;
    }
    
    function setTokensBridge(address _tokensBridge) external onlyRole(GOVERNANCE_ROLE) {
        tokensBridge = ITokensBridge(_tokensBridge);
    }

    function setTREXComponents(
        address _identityRegistry,
        address _trustedIssuersRegistry,
        address _claimTopicsRegistry,
        address _compliance
    ) external onlyRole(GOVERNANCE_ROLE) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        trustedIssuersRegistry = ITrustedIssuersRegistry(_trustedIssuersRegistry);
        claimTopicsRegistry = IClaimTopicsRegistry(_claimTopicsRegistry);
        compliance = ICompliance(_compliance);
    }
}