// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./IAKSStablecoin.sol";
import "./IAKSBridge.sol";

interface IKFShares {
    function initialize(
        string memory name,
        string memory symbol,
        uint256 totalShares,
        address aksToken,
        address aksBridge,
        address proxy
    ) external;
    
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function forceBurn(address account, uint256 amount) external;
    function lockShares(address account, uint256 amount) external;
    function unlockShares(address account) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function getCurrentPrice(uint256 shares) external view returns (uint256);
    function updatePricingModel(uint256 newBasePrice) external;
}