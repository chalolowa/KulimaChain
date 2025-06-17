// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @custom:security-contact locha.softwaredev@gmail.com
contract AvalancheKenyaShilling is ERC20, ERC20Burnable, ERC20Permit, Ownable, ERC20Pausable, ReentrancyGuard {
    address public bridge;
    address public reserve;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    event BridgeUpdated(address indexed previousBridge, address indexed newBridge);
    event ReserveUpdated(address indexed previousReserve, address indexed newReserve);
    event ReserveMint(address indexed to, uint256 amount);
    event ReserveBurn(address indexed from, uint256 amount);
    event BridgeBurn(address indexed from, uint256 amount);
    event BridgeMint(address indexed to, uint256 amount);

    constructor(address initialOwner)
        ERC20("Avalanche Kenya Shilling", "AKS")
        ERC20Permit("Avalanche Kenya Shilling")
        Ownable()
    {
        require(initialOwner != address(0), "Initial owner cannot be zero address");
    }

    modifier onlyBridge() {
        require(msg.sender == bridge && bridge != address(0), "Caller is not the authorized bridge");
        _;
    }

    modifier onlyReserve() {
        require(msg.sender == reserve && reserve != address(0), "Caller is not the authorized reserve");
        _;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }


    function setBridge(address _bridge) external onlyOwner {
        require(_bridge != address(0), "Bridge cannot be zero address");
        emit BridgeUpdated(bridge, _bridge);
        bridge = _bridge;
    }

    function setReserve(address _reserve) external onlyOwner {
        require(_reserve != address(0), "Reserve cannot be zero address");
        emit ReserveUpdated(reserve, _reserve);
        reserve = _reserve;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Reserve can mint tokens (after KES deposit)
    function reserveMint(address to, uint256 amount) external onlyReserve nonReentrant whenNotPaused {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        emit ReserveMint(to, amount);
    }

    // Reserve can burn tokens (during KES redemption)
    function reserveBurn(address from, uint256 amount) external onlyReserve nonReentrant whenNotPaused {
        require(from != address(0), "Burn from zero address");
        require(amount > 0, "Amount must be positive");
        
        _burn(from, amount);
        emit ReserveBurn(from, amount);
    }

    // Bridge burns during cross-chain transfer (source chain)
    function bridgeBurn(address from, uint256 amount) external onlyBridge nonReentrant whenNotPaused {
        require(from != address(0), "Burn from zero address");
        require(amount > 0, "Amount must be positive");
        
        _burn(from, amount);
        emit BridgeBurn(from, amount);
    }

    // Bridge mints during cross-chain transfer (destination chain)
    function bridgeMint(address to, uint256 amount) external onlyBridge nonReentrant whenNotPaused {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        emit BridgeMint(to, amount);
    }

    // Required for reserve-initiated burns without approval
    function burnFrom(address account, uint256 amount) public override(ERC20Burnable) {
        if (msg.sender == reserve) {
            _burn(account, amount);
            emit ReserveBurn(account, amount);
        } else {
            super.burnFrom(account, amount);
        }
    }
}