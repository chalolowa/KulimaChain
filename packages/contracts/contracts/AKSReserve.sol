// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/IFunctionsRouter.sol";

interface IAKS {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function pause() external;
    function unpause() external;
}

contract AKSReserve is ReentrancyGuard, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;
    
    address public owner;
    IAKS public immutable token;

    // Chainlink Functions configuration
    string public sourceCode;
    bytes public encryptedSecrets;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    string[] public args;
    bytes32 public donId;
    uint256 public lastRequestTimestamp;
    uint256 public constant REQUEST_INTERVAL = 3600; // 1 hour

    // Exchange rate storage
    uint256 public lastExchangeRate; // Stored with 8 decimals
    uint256 public lastUpdatedTimestamp;
    uint256 public constant ORACLE_DECIMALS = 8;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 7200; // 2 hours
    uint256 public constant MAX_EXCHANGE_RATE = 200 * 10**ORACLE_DECIMALS; // Max 200 KES per USD
    uint256 public constant MIN_EXCHANGE_RATE = 50 * 10**ORACLE_DECIMALS;  // Min 50 KES per USD
    
    // Reserve parameters
    uint256 public totalKESReserves;
    uint256 public minCollateralRatio = 100; // 100% minimum
    uint256 public maxSingleMint = 100000 * 10**18; // 100k AKS max per mint
    bool public paused;
    
    // Multi-signature auditor system
    mapping(address => bool) public auditors;
    uint256 public auditorsCount;
    uint256 public auditorsRequired = 1; // Can be increased for multi-sig
    
    // Pending operations for multi-sig
    struct PendingCollateralUpdate {
        uint256 kesAmount;
        uint256 confirmations;
        mapping(address => bool) confirmed;
        bool executed;
        uint256 timestamp;
        bool isAddition; // true for addition, false for subtraction
    }
    
    mapping(bytes32 => PendingCollateralUpdate) public pendingUpdates;
    uint256 public constant OPERATION_TIMEOUT = 24 hours;
    
    // Events
    event CollateralUpdateProposed(bytes32 indexed updateId, uint256 kesAmount, bool isAddition);
    event CollateralUpdateConfirmed(bytes32 indexed updateId, address auditor);
    event CollateralUpdated(uint256 newTotal, uint256 changeAmount, bool isAddition);
    event MintRequestFulfilled(address indexed user, uint256 kesAmount, uint256 collateralRatio);
    event BurnRequestExecuted(address indexed user, uint256 aksAmount);
    event AuditorAdded(address indexed auditor);
    event AuditorRemoved(address indexed auditor);
    event EmergencyPaused(uint256 collateralRatio);
    event CollateralRatioUpdated(uint256 oldRatio, uint256 newRatio);
    event ExchangeRateRequested(bytes32 requestId);
    event ExchangeRateUpdated(uint256 rate);
    event FunctionError(bytes32 requestId, bytes error);
    event MaxSingleMintUpdated(uint256 oldAmount, uint256 newAmount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Not authorized auditor");
        _;
    }

    modifier validCollateralRatio() {
        _;
        require(collateralRatio() >= minCollateralRatio, "Collateral ratio too low");
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Not paused");
        _;
    }

    constructor(
        address _token,
        address _functionsRouter,
        string memory _sourceCode,
        bytes memory _encryptedSecrets,
        uint64 _subscriptionId,
        bytes32 _donId,
        address _initialAuditor
    ) FunctionsClient(_functionsRouter) {
        require(_token != address(0), "Invalid token address");
        require(_initialAuditor != address(0), "Invalid auditor address");
        require(_functionsRouter != address(0), "Invalid Functions Router address");
        
        owner = msg.sender;
        token = IAKS(_token);
        
        // Set up Chainlink Functions
        sourceCode = _sourceCode;
        encryptedSecrets = _encryptedSecrets;
        subscriptionId = _subscriptionId;
        donId = _donId;
        
        // Set initial auditor
        auditors[_initialAuditor] = true;
        auditorsCount = 1;
        
        emit AuditorAdded(_initialAuditor);
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
        emit OwnershipTransferred(owner, newOwner);
    }

    function pause() external onlyOwner whenNotPaused {
        paused = true;
        token.pause();
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner whenPaused {
        paused = false;
        token.unpause();
        emit Unpaused(msg.sender);
    }

    // ========== Chainlink Functions Implementation ========== //
    
    /// @notice Set Functions configuration
    function setFunctionsConfig(
        string memory _sourceCode,
        bytes memory _encryptedSecrets,
        uint64 _subscriptionId,
        string[] memory _args,
        uint32 _gasLimit,
        bytes32 _donId
    ) external onlyOwner {
        require(_subscriptionId > 0, "Invalid subscription");
        require(_gasLimit > 0, "Invalid gas limit");
        
        sourceCode = _sourceCode;
        encryptedSecrets = _encryptedSecrets;
        subscriptionId = _subscriptionId;
        args = _args;
        gasLimit = _gasLimit;
        donId = _donId;
    }
    
    /// @notice Request latest KES/USD exchange rate
    function requestExchangeRate() external onlyOwner returns (bytes32) {
        require(
            block.timestamp >= lastRequestTimestamp + REQUEST_INTERVAL,
            "Rate request too frequent"
        );
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(sourceCode);
        
        if (encryptedSecrets.length > 0) {
            req.addSecretsReference(encryptedSecrets);
        }
        
        if (args.length > 0) {
            req.setArgs(args);
        }
        
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );
        
        lastRequestTimestamp = block.timestamp;
        emit ExchangeRateRequested(requestId);
        return requestId;
    }
    
    /// @notice Chainlink Functions response callback
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            emit FunctionError(requestId, err);
            return;
        }
        
        // Validate response
        require(response.length == 32, "Invalid response length");
        uint256 rate = abi.decode(response, (uint256));
        
        // Validate exchange rate bounds
        require(
            rate >= MIN_EXCHANGE_RATE && rate <= MAX_EXCHANGE_RATE,
            "Exchange rate out of bounds"
        );
        
        lastExchangeRate = rate;
        lastUpdatedTimestamp = block.timestamp;
        emit ExchangeRateUpdated(rate);
    }
    
    /// @notice Get current KES/USD price
    function getKESUSDPrice() public view returns (uint256, bool) {
        if (lastExchangeRate == 0) {
            return (0, true); // Not initialized
        }
        
        bool isStale = (block.timestamp - lastUpdatedTimestamp) > PRICE_STALENESS_THRESHOLD;
        uint256 normalizedPrice = lastExchangeRate * (10 ** (18 - ORACLE_DECIMALS));
        
        return (normalizedPrice, isStale);
    }

    // ========== Reserve Management Functions ========== //
    
    /// @notice Add a new auditor
    function addAuditor(address _auditor) external onlyOwner {
        require(_auditor != address(0), "Invalid auditor address");
        require(!auditors[_auditor], "Already an auditor");
        
        auditors[_auditor] = true;
        auditorsCount++;
        
        emit AuditorAdded(_auditor);
    }

    /// @notice Remove an auditor
    function removeAuditor(address _auditor) external onlyOwner {
        require(auditors[_auditor], "Not an auditor");
        require(auditorsCount > 1, "Cannot remove last auditor");
        
        auditors[_auditor] = false;
        auditorsCount--;
        
        emit AuditorRemoved(_auditor);
    }

    /// @notice Set number of auditors required for operations
    function setAuditorsRequired(uint256 _required) external onlyOwner {
        require(_required > 0 && _required <= auditorsCount, "Invalid required count");
        auditorsRequired = _required;
    }

    /// @notice Propose collateral update (first step of multi-sig)
    function proposeCollateralUpdate(uint256 kesAmount, bool isAddition) external onlyAuditor returns (bytes32) {
        require(kesAmount > 0, "Amount must be positive");
        
        if (!isAddition) {
            require(kesAmount <= totalKESReserves, "Cannot remove more than available reserves");
        }
        
        bytes32 updateId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            kesAmount,
            isAddition,
            block.number
        ));
        
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        update.kesAmount = kesAmount;
        update.isAddition = isAddition;
        update.timestamp = block.timestamp;
        update.confirmed[msg.sender] = true;
        update.confirmations = 1;
        
        emit CollateralUpdateProposed(updateId, kesAmount, isAddition);
        
        // If only 1 auditor required, execute immediately
        if (auditorsRequired == 1) {
            _executeCollateralUpdate(updateId);
        }
        
        return updateId;
    }

    /// @notice Confirm collateral update (additional auditor signatures)
    function confirmCollateralUpdate(bytes32 updateId) external onlyAuditor {
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        require(update.kesAmount > 0, "Update does not exist");
        require(!update.executed, "Update already executed");
        require(!update.confirmed[msg.sender], "Already confirmed");
        require(block.timestamp <= update.timestamp + OPERATION_TIMEOUT, "Update expired");
        
        update.confirmed[msg.sender] = true;
        update.confirmations++;
        
        emit CollateralUpdateConfirmed(updateId, msg.sender);
        
        // Execute if enough confirmations
        if (update.confirmations >= auditorsRequired) {
            _executeCollateralUpdate(updateId);
        }
    }

    /// @notice Internal function to execute collateral update
    function _executeCollateralUpdate(bytes32 updateId) internal {
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        require(!update.executed, "Already executed");
        
        update.executed = true;
        
        if (update.isAddition) {
            totalKESReserves += update.kesAmount;
        } else {
            totalKESReserves -= update.kesAmount;
        }
        
        emit CollateralUpdated(totalKESReserves, update.kesAmount, update.isAddition);
    }

    /// @notice Mint AKS when KES deposited (with enhanced checks)
    function mintAKS(
        address recipient,
        uint256 kesAmount
    ) external onlyOwner nonReentrant whenNotPaused validCollateralRatio {
        require(recipient != address(0), "Invalid recipient");
        require(kesAmount > 0, "Amount must be positive");
        require(kesAmount <= maxSingleMint, "Amount exceeds single mint limit");
        
        uint256 newSupply = token.totalSupply() + kesAmount;
        require(
            newSupply * 100 <= totalKESReserves * minCollateralRatio,
            "Insufficient collateral for mint"
        );
        
        token.mint(recipient, kesAmount);
        
        uint256 currentRatio = collateralRatio();
        emit MintRequestFulfilled(recipient, kesAmount, currentRatio);
        
        // Auto-pause if ratio becomes critical (5% buffer)
        if (currentRatio < minCollateralRatio + 5) {
            _triggerEmergencyPause();
        }
    }

    /// @notice Burn AKS and release KES (with validation)
    function burnAKS(uint256 aksAmount) external nonReentrant whenNotPaused {
        require(aksAmount > 0, "Amount must be positive");
        require(
            token.balanceOf(msg.sender) >= aksAmount,
            "Insufficient AKS balance"
        );
        
        token.burnFrom(msg.sender, aksAmount);
        emit BurnRequestExecuted(msg.sender, aksAmount);
    }

    /// @notice Get real-time collateralization ratio with precision
    function collateralRatio() public view returns (uint256) {
        uint256 supply = token.totalSupply();
        if (supply == 0) return type(uint256).max; // Infinite ratio when no tokens
        return (totalKESReserves * 100) / supply;
    }

    /// @notice Emergency pause triggered by auditors
    function emergencyPause() external onlyAuditor {
        _triggerEmergencyPause();
    }

    /// @notice Internal emergency pause function
    function _triggerEmergencyPause() internal {
        uint256 currentRatio = collateralRatio();
        require(currentRatio < minCollateralRatio, "Ratio is healthy");
        
        paused = true;
        token.pause();
        emit Paused(msg.sender);
        emit EmergencyPaused(currentRatio);
    }

    /// @notice Emergency unpause (requires owner)
    function emergencyUnpause() external onlyOwner whenPaused {
        require(collateralRatio() >= minCollateralRatio, "Collateral ratio still low");
        
        paused = false;
        token.unpause();
        emit Unpaused(msg.sender);
    }

    /// @notice Update minimum collateral ratio
    function setMinCollateralRatio(uint256 _ratio) external onlyOwner {
        require(_ratio >= 100, "Ratio cannot be less than 100%");
        require(_ratio <= 200, "Ratio cannot exceed 200%");
        
        uint256 oldRatio = minCollateralRatio;
        minCollateralRatio = _ratio;
        
        emit CollateralRatioUpdated(oldRatio, _ratio);
    }

    /// @notice Set maximum single mint amount
    function setMaxSingleMint(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        
        uint256 oldAmount = maxSingleMint;
        maxSingleMint = _amount;
        
        emit MaxSingleMintUpdated(oldAmount, _amount);
    }

    // ========== View Functions ========== //

    /// @notice Get comprehensive reserve statistics
    function getReserveStats() external view returns (
        uint256 totalReserves,
        uint256 totalSupply,
        uint256 currentRatio,
        uint256 minRatio,
        bool isPausedState
    ) {
        return (
            totalKESReserves,
            token.totalSupply(),
            collateralRatio(),
            minCollateralRatio,
            paused
        );
    }

    /// @notice Get pending update details
    function getPendingUpdate(bytes32 updateId) external view returns (
        uint256 kesAmount,
        uint256 confirmations,
        bool executed,
        uint256 timestamp,
        bool expired,
        bool isAddition
    ) {
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        return (
            update.kesAmount,
            update.confirmations,
            update.executed,
            update.timestamp,
            block.timestamp > update.timestamp + OPERATION_TIMEOUT,
            update.isAddition
        );
    }

    /// @notice Check if an address is an auditor
    function isAuditor(address _address) external view returns (bool) {
        return auditors[_address];
    }

    /// @notice Get current Functions configuration
    function getFunctionsConfig() external view returns (
        string memory,
        bytes memory,
        uint64,
        uint32,
        bytes32
    ) {
        return (
            sourceCode,
            encryptedSecrets,
            subscriptionId,
            gasLimit,
            donId
        );
    }

    // ========== Emergency Functions ========== //

    /// @notice Emergency withdraw stuck tokens (excluding AKS)
    function emergencyWithdraw(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(tokenAddress != address(token), "Cannot withdraw AKS");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        IERC20(tokenAddress).transfer(to, amount);
    }

    /// @notice Check if pending update has been confirmed by specific auditor
    function hasConfirmed(bytes32 updateId, address auditor) external view returns (bool) {
        return pendingUpdates[updateId].confirmed[auditor];
    }
}
