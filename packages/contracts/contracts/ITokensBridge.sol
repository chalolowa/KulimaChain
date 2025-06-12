// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface ITokensBridge {
    function sendAKS(
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _amount
    ) external payable;
    
    function sendKFS(
        uint64 _destinationChainSelector,
        address _receiver,
        uint256 _amount
    ) external payable;
    
    function receiveAKS(
        address sender,
        uint64 sourceChain,
        address receiver,
        uint256 amount
    ) external;
    
    function receiveKFS(
        address sender,
        uint64 sourceChain,
        address receiver,
        uint256 amount
    ) external;
}