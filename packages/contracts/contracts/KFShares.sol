// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "./IAKSStablecoin.sol";
import "./ITokensBridge.sol";

contract KFShares is Initializable, ERC20Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PROXY_ROLE = keccak256("PROXY_ROLE");

    IAKSStablecoin public aksToken;
    ITokensBridge public tokensBridge;

    uint256 public basePricePerShare; // in AKS
    mapping(address => uint256) public lockedShares;
    mapping(address => bool) public whitelisted;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        uint256 totalShares,
        address admin,
        address _aksToken,
        address _tokensBridge,
        address proxy
    ) external initializer {
        require(totalShares > 0, "Total shares must be greater than zero");

        __ERC20_init(name, symbol);
        __AccessControl_init();
        __UUPSUpgradeable_init();

        aksToken = IAKSStablecoin(_aksToken);
        tokensBridge = ITokensBridge(_tokensBridge);
        basePricePerShare = 1e18;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROXY_ROLE, proxy);
        _grantRole(UPGRADER_ROLE, admin);

        _mint(proxy, totalShares);
    }

    // Proxy/minting functions
    function mint(address to, uint256 amount) external onlyRole(PROXY_ROLE) {
        _mint(to, amount);
    }

    function burn(uint256 amount) external onlyRole(PROXY_ROLE) {
        _burn(msg.sender, amount);
    }

    function forceBurn(address account, uint256 amount) external onlyRole(PROXY_ROLE) {
        _burn(account, amount);
    }

    function lockShares(address account, uint256 amount) external onlyRole(PROXY_ROLE) {
        lockedShares[account] += amount;
    }

    function unlockShares(address account) external onlyRole(PROXY_ROLE) {
        lockedShares[account] = 0;
    }

    function updatePricingModel(uint256 newBasePrice) external onlyRole(PROXY_ROLE) {
        basePricePerShare = newBasePrice;
    }

    function getCurrentPrice(uint256 shares) external view returns (uint256) {
        return shares * basePricePerShare;
    }

    // Transfer compliance: whitelist + lock checks
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(whitelisted[to], "Receiver not whitelisted");
        require(balanceOf(msg.sender) - lockedShares[msg.sender] >= amount, "Insufficient unlocked");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(whitelisted[to], "Receiver not whitelisted");
        require(balanceOf(from) - lockedShares[from] >= amount, "Insufficient unlocked");
        return super.transferFrom(from, to, amount);
    }

    // Cross-chain transfers (lock locally + send via bridge)
    function transferCrossChain(
        uint64 destinationChainSelector,
        address receiver,
        uint256 amount
    ) external payable {
        require(whitelisted[receiver], "Cross-chain receiver not whitelisted");
        require(balanceOf(msg.sender) - lockedShares[msg.sender] >= amount, "Insufficient unlocked");

        _transfer(msg.sender, address(this), amount);
        lockedShares[address(this)] += amount;

        tokensBridge.sendKFS{value: msg.value}(destinationChainSelector, receiver, amount);
    }

    // Whitelist management
    function setWhitelisted(address account, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelisted[account] = status;
    }

    // Required for UUPS upgrades
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
