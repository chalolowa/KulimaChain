// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IAKSStablecoin.sol";

contract InsurancePayout is Ownable {
    using SafeERC20 for IAKSStablecoin;
    
    IAKSStablecoin public aks;
    
    // Payout parameters
    uint256 public constant MAX_DAILY_PAYOUT = 10_000_000 * 1e6; // 10M AKS
    mapping(address => uint256) public farmerDailyPayouts;
    mapping(uint256 => uint256) public dailyPayoutTotals;
    
    event FarmerPayout(
        address indexed farmer,
        uint256 amount,
        bytes32 indexed policyId
    );

    constructor(address _aks) {
        aks = IAKSStablecoin(_aks);
    }

    function processPayout(
        address farmer,
        uint256 amount,
        bytes32 policyId
    ) external onlyOwner {
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
        
        // Transfer AKS to farmer
        aks.transfer(farmer, amount);
        emit FarmerPayout(farmer, amount, policyId);
    }
}