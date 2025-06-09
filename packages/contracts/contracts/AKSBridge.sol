/ SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IAKS {
    function bridgeBurn(address from, uint256 amount) external;
    function bridgeMint(address to, uint256 amount) external;
}

contract AKSBridge is CCIPReceiver, Ownable, Pausable, ReentrancyGuard {
    IAKS public immutable token;
    IRouterClient public router;
    uint64 public currentChainSelector;
    
    // Chain Selectors: Avalanche=14767482510784806043, Ethereum=16015286601757825753
    mapping(uint64 => address) public destinationBridges;
    mapping(uint64 => bool) public supportedChains;
    
    uint256 public constant MAX_TRANSFER_AMOUNT = 1000000 * 10**18; // 1M tokens max per transfer
    
    event TokensSent(
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount,
        bytes32 messageId
    );
    
    event TokensReceived(
        uint64 sourceChainSelector,
        address receiver,
        uint256 amount,
        bytes32 messageId
    );
    
    event DestinationBridgeSet(uint64 chainSelector, address bridge);
    event ChainSupportUpdated(uint64 chainSelector, bool supported);

    constructor(
        address _router,
        address _token,
        uint64 _chainSelector
    ) CCIPReceiver(_router) {
        router = IRouterClient(_router);
        token = IAKS(_token);
        currentChainSelector = _chainSelector;
    }

    function setDestinationBridge(
        uint64 _chainSelector,
        address _bridge
    ) external onlyOwner {
        require(_bridge != address(0), "Invalid bridge address");
        require(_chainSelector != currentChainSelector, "Cannot set self as destination");
        
        destinationBridges[_chainSelector] = _bridge;
        supportedChains[_chainSelector] = true;
        
        emit DestinationBridgeSet(_chainSelector, _bridge);
        emit ChainSupportUpdated(_chainSelector, true);
    }
    
    function setSupportedChain(uint64 _chainSelector, bool _supported) external onlyOwner {
        supportedChains[_chainSelector] = _supported;
        emit ChainSupportUpdated(_chainSelector, _supported);
    }

    // Send AKS to another chain
    function sendAKS(
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _amount
    ) external payable whenNotPaused nonReentrant {
        require(_receiver != address(0), "Invalid receiver address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= MAX_TRANSFER_AMOUNT, "Amount exceeds maximum transfer limit");
        require(supportedChains[_destinationChainSelector], "Destination chain not supported");
        require(
            destinationBridges[_destinationChainSelector] != address(0),
            "Destination bridge not set"
        );

        // Burn tokens first
        token.bridgeBurn(msg.sender, _amount);

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationBridges[_destinationChainSelector]),
            data: abi.encode(_receiver, _amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0) // Pay fees in native gas
        });

        uint256 fee = router.getFee(_destinationChainSelector, message);
        require(msg.value >= fee, "Insufficient fee");

        bytes32 messageId = router.ccipSend{value: fee}(
            _destinationChainSelector,
            message
        );
        
        // Refund excess fee
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }

        emit TokensSent(_destinationChainSelector, _receiver, _amount, messageId);
    }

    // Receive AKS from another chain
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override whenNotPaused {
        uint64 sourceChainSelector = message.sourceChainSelector;
        require(supportedChains[sourceChainSelector], "Source chain not supported");
        
        address sender = abi.decode(message.sender, (address));
        require(
            sender == destinationBridges[sourceChainSelector],
            "Invalid sender"
        );

        (address receiver, uint256 amount) = abi.decode(
            message.data,
            (address, uint256)
        );
        
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Invalid amount");

        token.bridgeMint(receiver, amount);
        emit TokensReceived(sourceChainSelector, receiver, amount, message.messageId);
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // Get estimated fee for cross-chain transfer
    function getTransferFee(
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _amount
    ) external view returns (uint256) {
        require(
            destinationBridges[_destinationChainSelector] != address(0),
            "Destination bridge not set"
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationBridges[_destinationChainSelector]),
            data: abi.encode(_receiver, _amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });

        return router.getFee(_destinationChainSelector, message);
    }

    // Allow owner to withdraw stuck funds
    function withdraw(address _beneficiary) external onlyOwner {
        require(_beneficiary != address(0), "Invalid beneficiary");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(_beneficiary).transfer(balance);
    }
    
    // Emergency token recovery
    function recoverToken(address _token, address _beneficiary, uint256 _amount) external onlyOwner {
        require(_token != address(token), "Cannot recover bridge token");
        require(_beneficiary != address(0), "Invalid beneficiary");
        
        IERC20(_token).transfer(_beneficiary, _amount);
    }
}