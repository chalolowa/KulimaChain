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

contract AKSReserve is Ownable, ReentrancyGuard, Pausable, FunctionsClient {
    IAKS public immutable token;

    // Chainlink Functions configuration
    bytes public sourceCode;
    string public secretsURL;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    bytes public encryptedSecrets;
    bytes public args;
    uint32 public donVersion = 1;

    // Exchange rate storage
    uint256 public lastExchangeRate; // Stored with 8 decimals
    uint256 public lastUpdatedTimestamp;
    uint256 public constant ORACLE_DECIMALS = 8;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 3600; // 1 hour
    
    // Reserve parameters
    uint256 public totalKESReserves;
    uint256 public minCollateralRatio = 100; // 100% minimum
    uint256 public maxSingleMint = 100000 * 10**18; // 100k AKS max per mint
    
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
    }
    
    mapping(bytes32 => PendingCollateralUpdate) public pendingUpdates;
    uint256 public constant OPERATION_TIMEOUT = 24 hours;
    
    // Events
    event CollateralUpdateProposed(bytes32 indexed updateId, uint256 kesAmount);
    event CollateralUpdateConfirmed(bytes32 indexed updateId, address auditor);
    event CollateralUpdated(uint256 newTotal, uint256 addedAmount);
    event MintRequestFulfilled(address indexed user, uint256 kesAmount, uint256 collateralRatio);
    event BurnRequestExecuted(address indexed user, uint256 aksAmount);
    event AuditorAdded(address indexed auditor);
    event AuditorRemoved(address indexed auditor);
    event EmergencyPaused(uint256 collateralRatio);
    event CollateralRatioUpdated(uint256 oldRatio, uint256 newRatio);
    event ExchangeRateRequested(bytes32 requestId);
    event ExchangeRateUpdated(uint256 rate);
    event FunctionError(bytes32 requestId, bytes error);

    constructor(
        address _token,
        address _functionsRouter,
        bytes memory _sourceCode,
        string memory _secretsURL,
        uint64 _subscriptionId,
        address _initialAuditor
    ) ERC20("Avalanche Kenya Shilling", "AKS") FunctionsClient(_functionsRouter) {
        require(_token != address(0), "Invalid token address");
        require(_initialAuditor != address(0), "Invalid auditor address");
        require(_functionsRouter != address(0), "Invalid Functions Router address");
        
        token = IAKS(_token);
        
        // Set up Chainlink Functions
        sourceCode = _sourceCode;
        secretsURL = _secretsURL;
        subscriptionId = _subscriptionId;
        
        // Set initial auditor
        auditors[_initialAuditor] = true;
        auditorsCount = 1;
        
        emit AuditorAdded(_initialAuditor);
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Not authorized auditor");
        _;
    }

    modifier validCollateralRatio() {
        _;
        require(collateralRatio() >= minCollateralRatio, "Collateral ratio too low");
    }

    // ========== Chainlink Functions Implementation ========== //
    
    /// @notice Set Functions configuration
    function setFunctionsConfig(
        bytes memory _sourceCode,
        string memory _secretsURL,
        uint64 _subscriptionId,
        bytes memory _encryptedSecrets,
        bytes memory _args,
        uint32 _gasLimit
    ) external onlyOwner {
        sourceCode = _sourceCode;
        secretsURL = _secretsURL;
        subscriptionId = _subscriptionId;
        encryptedSecrets = _encryptedSecrets;
        args = _args;
        gasLimit = _gasLimit;
    }
    
    /// @notice Request latest KES/USD exchange rate
    function requestExchangeRate() external onlyOwner {
        bytes32 requestId = _sendRequest(
            subscriptionId,
            sourceCode,
            encryptedSecrets,
            secretsURL,
            args,
            gasLimit,
            donVersion
        );
        
        emit ExchangeRateRequested(requestId);
    }
    
    /// @notice Chainlink Functions response callback
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            emit FunctionError(requestId, err);
            return;
        }
        
        // Response should be a single uint256 value
        if (response.length == 32) {
            uint256 rate = abi.decode(response, (uint256));
            lastExchangeRate = rate;
            lastUpdatedTimestamp = block.timestamp;
            emit ExchangeRateUpdated(rate);
        } else {
            emit FunctionError(requestId, "Invalid response length");
        }
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
    // Auditor management
    function addAuditor(address _auditor) external onlyOwner {
        require(_auditor != address(0), "Invalid auditor address");
        require(!auditors[_auditor], "Already an auditor");
        
        auditors[_auditor] = true;
        auditorsCount++;
        
        emit AuditorAdded(_auditor);
    }

    function removeAuditor(address _auditor) external onlyOwner {
        require(auditors[_auditor], "Not an auditor");
        require(auditorsCount > 1, "Cannot remove last auditor");
        
        auditors[_auditor] = false;
        auditorsCount--;
        
        emit AuditorRemoved(_auditor);
    }

    function setAuditorsRequired(uint256 _required) external onlyOwner {
        require(_required > 0 && _required <= auditorsCount, "Invalid required count");
        auditorsRequired = _required;
    }

    // Propose collateral update (first step of multi-sig)
    function proposeCollateralUpdate(uint256 kesAmount) external onlyAuditor returns (bytes32) {
        bytes32 updateId = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            kesAmount,
            block.number
        ));
        
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        update.kesAmount = kesAmount;
        update.timestamp = block.timestamp;
        update.confirmed[msg.sender] = true;
        update.confirmations = 1;
        
        emit CollateralUpdateProposed(updateId, kesAmount);
        
        // If only 1 auditor required, execute immediately
        if (auditorsRequired == 1) {
            _executeCollateralUpdate(updateId);
        }
        
        return updateId;
    }

    // Confirm collateral update (additional auditor signatures)
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

    function _executeCollateralUpdate(bytes32 updateId) internal {
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        require(!update.executed, "Already executed");
        
        update.executed = true;
        totalKESReserves += update.kesAmount;
        
        emit CollateralUpdated(totalKESReserves, update.kesAmount);
    }

    // Mint AKS when KES deposited (with enhanced checks)
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
        
        // Auto-pause if ratio becomes critical
        if (currentRatio < minCollateralRatio + 5) { // 5% buffer
            _triggerEmergencyPause();
        }
    }

    // Burn AKS and release KES (with validation)
    function burnAKS(uint256 aksAmount) external nonReentrant whenNotPaused {
        require(aksAmount > 0, "Amount must be positive");
        
        // Verify user has sufficient balance before burning
        token.burnFrom(msg.sender, aksAmount);
        
        emit BurnRequestExecuted(msg.sender, aksAmount);
        
        // Note: Off-chain process handles KES bank transfer
    }

    // Get real-time collateralization ratio with precision
    function collateralRatio() public view returns (uint256) {
        uint256 supply = token.totalSupply();
        if (supply == 0) return type(uint256).max; // Infinite ratio when no tokens
        return (totalKESReserves * 100) / supply;
    }

    // Emergency pause with automatic trigger
    function emergencyPause() external onlyAuditor {
        _triggerEmergencyPause();
    }

    function _triggerEmergencyPause() internal {
        uint256 currentRatio = collateralRatio();
        require(currentRatio < minCollateralRatio, "Ratio is healthy");
        
        _pause();
        token.pause();
        
        emit EmergencyPaused(currentRatio);
    }

    // Emergency unpause (requires owner)
    function emergencyUnpause() external onlyOwner {
        require(collateralRatio() >= minCollateralRatio, "Collateral ratio still low");
        
        _unpause();
        token.unpause();
    }

    // Update minimum collateral ratio (with event)
    function setMinCollateralRatio(uint256 _ratio) external onlyOwner {
        require(_ratio >= 100, "Ratio cannot be less than 100%");
        require(_ratio <= 200, "Ratio cannot exceed 200%");
        
        uint256 oldRatio = minCollateralRatio;
        minCollateralRatio = _ratio;
        
        emit CollateralRatioUpdated(oldRatio, _ratio);
    }

    // Set maximum single mint amount
    function setMaxSingleMint(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        maxSingleMint = _amount;
    }

    // View functions for transparency
    function getReserveStats() external view returns (
        uint256 totalReserves,
        uint256 totalSupply,
        uint256 currentRatio,
        uint256 minRatio,
        bool isPaused
    ) {
        return (
            totalKESReserves,
            token.totalSupply(),
            collateralRatio(),
            minCollateralRatio,
            paused()
        );
    }

    function getPendingUpdate(bytes32 updateId) external view returns (
        uint256 kesAmount,
        uint256 confirmations,
        bool executed,
        uint256 timestamp,
        bool expired
    ) {
        PendingCollateralUpdate storage update = pendingUpdates[updateId];
        return (
            update.kesAmount,
            update.confirmations,
            update.executed,
            update.timestamp,
            block.timestamp > update.timestamp + OPERATION_TIMEOUT
        );
    }

    // Emergency functions for stuck tokens (if any)
    function emergencyWithdraw(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(tokenAddress != address(token), "Cannot withdraw AKS");
        require(to != address(0), "Invalid recipient");
        
        IERC20(tokenAddress).transfer(to, amount);
    }
}
