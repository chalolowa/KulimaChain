// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/CCIPAddress.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IcKES.sol";
import "./cKESMinter.sol";

contract KulimaTokenManager is CCIPReceiver, Ownable {
    using SafeERC20 for IERC20;
    using CCIPAddress for address;

    //contracts
    IcKES public immutable cKES; // cKES token contract
    cKESMinter public immutable minter; // cKES minter contract
    
    // Token addresses
    address public immutable cKES;
    address public immutable KFS;
    
    // Chainlink CCIP config
    mapping(uint64 => address) public destinationContracts;
    mapping(bytes32 => bool) public completedTransactions;
    
    // Payout parameters
    uint256 public constant MAX_DAILY_PAYOUT = 10_000_000 * 1e6; // 10M cKES
    mapping(address => uint256) public farmerDailyPayouts;
    mapping(uint256 => uint256) public dailyPayoutTotals;
    
    // Events
    event FarmerPayout(
        address indexed farmer,
        uint256 amount,
        bytes32 indexed policyId,
        bytes32 messageId
    );
    event FarmSharesTransferred(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 messageId
    );
    event CrossChainSuccess(bytes32 messageId);
    event CrossChainFailure(bytes32 messageId, bytes reason);

    constructor(
        address _router,
        address _cKES,
        address _KFS,
        address minter
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        cKES = IcKES(cKES);
        minter = cKESMinter(minter);
        KFS = _KFS;
    }

    /**
     * @notice Process insurance payout to farmer in cKES using CCIP
     */
    function processPayout(
        address farmer,
        uint256 amount,
        bytes32 policyId,
        uint64 destinationChain
    ) external payable onlyOwner returns (bytes32 messageId) {
        require(amount > 0, "Invalid amount");
        
        // Check daily limits
        uint256 today = block.timestamp / 1 days;
        uint256 farmerDaily = farmerDailyPayouts[farmer] + amount;
        uint256 systemDaily = dailyPayoutTotals[today] + amount;
        
        require(farmerDaily <= 500_000 * 1e6, "Farmer daily limit exceeded");
        require(systemDaily <= MAX_DAILY_PAYOUT, "System daily limit exceeded");
        
        // Update payout tracking
        farmerDailyPayouts[farmer] = farmerDaily;
        dailyPayoutTotals[today] = systemDaily;
        
        // Build CCIP message
        if (destinationChain == 0) {
            // Local payout - mint directly
            minter.mint(farmer, amount);
            emit FarmerPayout(farmer, amount, policyId, bytes32(0));
            emit cKESMinted(farmer, amount);
            return bytes32(0);
        } else {
            // Cross-chain payout via CCIP
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(destinationContracts[destinationChain]),
                data: abi.encode(farmer, policyId, amount),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: "",
                feeToken: address(0)
            });
        
            // Send via CCIP
            IRouterClient router = IRouterClient(getRouter());
            uint256 fee = router.getFee(destinationChain, message);
            require(msg.value >= fee, "Insufficient CCIP fee");
            
            messageId = router.ccipSend{value: fee}(destinationChain, message);
            
            emit FarmerPayout(farmer, amount, policyId, messageId);
            return messageId;
        }
    }

    /**
     * @notice Transfer farm shares using CCIP
     */
    function transferFarmShares(
        address from,
        address to,
        uint256 amount,
        uint64 destinationChain
    ) external payable onlyOwner returns (bytes32 messageId) {
        // Take tokens into custody
        IERC20(KFS).safeTransferFrom(from, address(this), amount);
        
        // Build CCIP message
        if (destinationChain == 0) {
            // Local transfer
            KFS.safeTransfer(to, amount);
            emit FarmSharesTransferred(from, to, amount, bytes32(0));
            return bytes32(0);
        } else {
            // Cross-chain transfer via CCIP
            Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
            tokenAmounts[0] = Client.EVMTokenAmount(address(KFS), amount);
            
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(destinationContracts[destinationChain]),
                data: abi.encode(to),
                tokenAmounts: tokenAmounts,
                extraArgs: "",
                feeToken: address(0)
            });
            
            IRouterClient router = IRouterClient(getRouter());
            uint256 fee = router.getFee(destinationChain, message);
            require(msg.value >= fee, "Insufficient CCIP fee");
            
            messageId = router.ccipSend{value: fee}(destinationChain, message);
            emit FarmSharesTransferred(from, to, amount, messageId);
            return messageId;
        }
    }

    /**
     * @notice Handle incoming CCIP messages
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        bytes32 messageId = message.messageId;
        require(!completedTransactions[messageId], "Already processed");
        
        try this._processMessage(message) {
            completedTransactions[messageId] = true;
            emit CrossChainSuccess(messageId);
        } catch (bytes memory reason) {
            emit CrossChainFailure(messageId, reason);
        }
    }

    /**
     * @notice Process incoming token transfers
     */
    function _processMessage(
        Client.Any2EVMMessage memory message
    ) external {
        require(msg.sender == address(this), "Internal call only");
        
        // Process token transfers
        for (uint256 i = 0; i < message.destTokenAmounts.length; i++) {
            Client.EVMTokenAmount memory tokenAmount = message.destTokenAmounts[i];
            
            if (tokenAmount.token == cKES) {
                // Insurance payout
                (address farmer, bytes32 policyId) = abi.decode(message.data, (address, bytes32));
                IERC20(cKES).safeTransfer(farmer, tokenAmount.amount);
            } 
            else if (tokenAmount.token == KFS) {
                // Share transfer
                address receiver = abi.decode(message.data, (address));
                IERC20(KFS).safeTransfer(receiver, tokenAmount.amount);
            }
        }
    }

    /**
     * @notice Set destination contract for a chain
     */
    function setDestinationContract(
        uint64 chainSelector,
        address contractAddress
    ) external onlyOwner {
        destinationContracts[chainSelector] = contractAddress;
    }

    /**
     * @notice Withdraw tokens in emergency (multi-sig protected)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @notice Mint cKES locally (for same-chain operations)
     */
    function mintcKES(address farmer, uint256 amount) external onlyOwner {
        minter.mint(farmer, amount);
        emit cKESMinted(farmer, amount);
    }
}