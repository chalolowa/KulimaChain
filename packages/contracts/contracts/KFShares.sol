// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAKSStablecoin.sol";
import "./ITokensBridge.sol";

contract KFShares is ERC20, Ownable {
    IAKSStablecoin public aksToken;
    ITokensBridge public tokensBridge;
    address public proxy;
    
    // Pricing
    uint256 public basePricePerShare; // Price per share in AKS
    mapping(address => uint256) public lockedShares;
    
    constructor() ERC20("KFShares", "KFS") {}
    
    function initialize(
        string memory name,
        string memory symbol,
        uint256 totalShares,
        address _aksToken,
        address _tokensBridge,
        address _proxy
    ) external onlyOwner {
        _name = name;
        _symbol = symbol;
        aksToken = IAKSStablecoin(_aksToken);
        tokensBridge = ITokensBridge(_tokensBridge);
        proxy = _proxy;
        basePricePerShare = 1e18; // 1 AKS per share by default
        _mint(_proxy, totalShares);
    }
    
    modifier onlyProxy() {
        require(msg.sender == proxy, "Only proxy");
        _;
    }
    
    function mint(address to, uint256 amount) external onlyProxy {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external onlyProxy {
        _burn(msg.sender, amount);
    }
    
    function forceBurn(address account, uint256 amount) external onlyProxy {
        _burn(account, amount);
    }
    
    function lockShares(address account, uint256 amount) external onlyProxy {
        lockedShares[account] += amount;
    }
    
    function unlockShares(address account) external onlyProxy {
        lockedShares[account] = 0;
    }
    
    function getCurrentPrice(uint256 shares) external view returns (uint256) {
        return shares * basePricePerShare;
    }
    
    function updatePricingModel(uint256 newBasePrice) external onlyProxy {
        basePricePerShare = newBasePrice;
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(balanceOf(msg.sender) - lockedShares[msg.sender] >= amount, "Locked shares");
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(balanceOf(from) - lockedShares[from] >= amount, "Locked shares");
        return super.transferFrom(from, to, amount);
    }
    
    // Cross-chain functions
    function transferCrossChain(
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount
    ) external payable {
        require(balanceOf(msg.sender) - lockedShares[msg.sender] >= amount, "Locked shares");
        
        // Lock shares locally
        _transfer(msg.sender, address(this), amount);
        lockedShares[address(this)] += amount;
        
        // Initiate cross-chain transfer
        tokensBridge.sendKFS{value: msg.value}(
            destinationChainSelector,
            receiver,
            amount
        );
    }
}