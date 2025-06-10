// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IAKSStablecoin {
    // Events
    event BridgeUpdated(address indexed previousBridge, address indexed newBridge);
    event ReserveUpdated(address indexed previousReserve, address indexed newReserve);
    event ReserveMint(address indexed to, uint256 amount);
    event ReserveBurn(address indexed from, uint256 amount);
    event BridgeBurn(address indexed from, uint256 amount);
    event BridgeMint(address indexed to, uint256 amount);
    
    // ERC20 standard functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // ERC20 metadata
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    
    // Contract-specific state variables
    function bridge() external view returns (address);
    function reserve() external view returns (address);
    function MAX_SUPPLY() external view returns (uint256);
    
    // Owner functions
    function setBridge(address _bridge) external;
    function setReserve(address _reserve) external;
    function pause() external;
    function unpause() external;
    
    // Reserve functions
    function reserveMint(address to, uint256 amount) external;
    function reserveBurn(address from, uint256 amount) external;
    
    // Bridge functions
    function bridgeBurn(address from, uint256 amount) external;
    function bridgeMint(address to, uint256 amount) external;
    
    // Burnable functions
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    
    // Pausable state
    function paused() external view returns (bool);
}