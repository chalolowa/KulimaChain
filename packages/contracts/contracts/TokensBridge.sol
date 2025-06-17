// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAKS {
    function bridgeBurn(address from, uint256 amount) external;
    function bridgeMint(address to, uint256 amount) external;
}

interface IKFS {
    function bridgeBurn(address from, uint256 amount) external;
    function bridgeMint(address to, uint256 amount) external;
    function lockShares(address account, uint256 amount) external;
    function unlockShares(address account) external;
}

contract TokensBridge is CCIPReceiver, Ownable, ReentrancyGuard {
    IAKS public immutable aksToken;
    IRouterClient public router;
    uint64 public currentChainSelector;
    
    // Chain Selectors
    mapping(uint64 => address) public destinationBridges;
    mapping(uint64 => bool) public supportedChains;
    
    // Token support
    mapping(address => bool) public supportedTokens;
    mapping(uint64 => mapping(address => address)) public tokenMappings; // sourceToken => destToken
    
    uint256 public constant MAX_TRANSFER_AMOUNT = 1000000 * 10**18; // 1M tokens max per transfer
    
    event TokensSent(
        uint64 destinationChainSelector,
        address token,
        address receiver,
        uint256 amount,
        bytes32 messageId
    );
    
    event TokensReceived(
        uint64 sourceChainSelector,
        address token,
        address receiver,
        uint256 amount,
        bytes32 messageId
    );
    
    event DestinationBridgeSet(uint64 chainSelector, address bridge);
    event ChainSupportUpdated(uint64 chainSelector, bool supported);
    event TokenSupportUpdated(address token, bool supported);
    event TokenMappingSet(uint64 chainSelector, address sourceToken, address destToken);

    constructor(
        address _router,
        address _aksToken,
        uint64 _chainSelector
    ) CCIPReceiver(_router) {
        router = IRouterClient(_router);
        aksToken = IAKS(_aksToken);
        currentChainSelector = _chainSelector;
        supportedTokens[_aksToken] = true;
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

    function setTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    function setTokenMapping(
        uint64 _chainSelector,
        address sourceToken,
        address destToken
    ) external onlyOwner {
        tokenMappings[_chainSelector][sourceToken] = destToken;
        emit TokenMappingSet(_chainSelector, sourceToken, destToken);
    }

    // Send tokens (AKS or KFS) to another chain
    function sendTokens(
        address tokenAddress,
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _amount
    ) external payable nonReentrant {
        require(_receiver != address(0), "Invalid receiver address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= MAX_TRANSFER_AMOUNT, "Amount exceeds maximum transfer limit");
        require(supportedChains[_destinationChainSelector], "Destination chain not supported");
        require(supportedTokens[tokenAddress], "Token not supported");
        require(
            destinationBridges[_destinationChainSelector] != address(0),
            "Destination bridge not set"
        );
        require(
            tokenMappings[_destinationChainSelector][tokenAddress] != address(0),
            "Token mapping not set"
        );

        // Handle token locking/burning
        if (tokenAddress == address(aksToken)) {
            aksToken.bridgeBurn(msg.sender, _amount);
        } else {
            // For KFS tokens
            IKFS(tokenAddress).bridgeBurn(msg.sender, _amount);
        }

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationBridges[_destinationChainSelector]),
            data: abi.encode(
                tokenMappings[_destinationChainSelector][tokenAddress], // dest token address
                _receiver, 
                _amount
            ),
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

        emit TokensSent(_destinationChainSelector, tokenAddress, _receiver, _amount, messageId);
    }

    // Receive tokens from another chain
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        uint64 sourceChainSelector = message.sourceChainSelector;
        require(supportedChains[sourceChainSelector], "Source chain not supported");
        
        address sender = abi.decode(message.sender, (address));
        require(
            sender == destinationBridges[sourceChainSelector],
            "Invalid sender"
        );

        (address tokenAddress, address receiver, uint256 amount) = abi.decode(
            message.data,
            (address, address, uint256)
        );
        
        require(receiver != address(0), "Invalid receiver");
        require(amount > 0, "Invalid amount");
        require(supportedTokens[tokenAddress], "Token not supported");

        // Handle token minting
        if (tokenAddress == address(aksToken)) {
            aksToken.bridgeMint(receiver, amount);
        } else {
            // For KFS tokens
            IKFS(tokenAddress).bridgeMint(receiver, amount);
        }
        
        emit TokensReceived(sourceChainSelector, tokenAddress, receiver, amount, message.messageId);
    }
    
    // Get estimated fee for cross-chain transfer
    function getTransferFee(
        uint64 _destinationChainSelector,
        address tokenAddress,
        address _receiver,
        uint256 _amount
    ) external view returns (uint256) {
        require(
            destinationBridges[_destinationChainSelector] != address(0),
            "Destination bridge not set"
        );
        require(
            tokenMappings[_destinationChainSelector][tokenAddress] != address(0),
            "Token mapping not set"
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationBridges[_destinationChainSelector]),
            data: abi.encode(
                tokenMappings[_destinationChainSelector][tokenAddress],
                _receiver, 
                _amount
            ),
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
        require(_token != address(aksToken), "Cannot recover bridge token");
        require(_beneficiary != address(0), "Invalid beneficiary");
        IERC20(_token).transfer(_beneficiary, _amount);
    }
}