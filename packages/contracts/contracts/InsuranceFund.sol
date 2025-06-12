// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IAKSStablecoin.sol";
import "./InsurancePayout.sol";

contract InsuranceFund is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    using SafeERC20 for IAKSStablecoin;
    
    struct Policy {
        address farmer;
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        string location;
        bool isActive;
        bool claimed;
    }

    // State variables
    mapping(bytes32 => Policy) public policies;
    mapping(bytes32 => bool) public pendingRequests;
    mapping(bytes32 => bytes32) public requestToPolicy;
    
    InsurancePayout public payoutManager;
    IAKSStablecoin public aks;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public donID;
    
    // Events
    event PolicyCreated(bytes32 policyId, address indexed farmer);
    event PayoutTriggered(bytes32 policyId, uint256 amount);
    event RequestFulfilled(bytes32 requestId, bytes response, bytes err);

    constructor(
        address router,
        address _payoutManager,
        address _aks,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        payoutManager = InsurancePayout(_payoutManager);
        aks = IAKSStablecoin(_aks);
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
    }

    /**
     * @notice Creates a new insurance policy
     * @param premium Premium amount in stablecoins
     * @param coverageAmount Payout amount if trigger condition met
     * @param duration Policy duration in seconds
     * @param location GPS coordinates "lat,lon"
     */
    function createPolicy(
        uint256 premium,
        uint256 coverageAmount,
        uint256 duration,
        string memory location
    ) external {
        require(premium > 0, "Invalid premium");
        require(coverageAmount > premium, "Invalid coverage");
        
        // Transfer premium from farmer in AKS
        aks.transferFrom(msg.sender, address(this), premium);
        
        bytes32 policyId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        policies[policyId] = Policy({
            farmer: msg.sender,
            premium: premium,
            coverageAmount: coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + duration,
            location: location,
            isActive: true,
            claimed: false
        });
        
        emit PolicyCreated(policyId, msg.sender);
    }

    /**
     * @notice Evaluates a policy for payout based on weather conditions
     * @param policyId Policy ID to evaluate
     * @param source JavaScript source code for Chainlink Functions
     * @param args Arguments for the JavaScript function
     */
    function evaluatePolicy(
        bytes32 policyId,
        string calldata source,
        string[] calldata args
    ) external onlyOwner {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy inactive");
        require(block.timestamp > policy.endDate, "Policy active");

        // JavaScript source code for Chainlink Functions
        string memory jsSourceCode = 
            "const tomorrowioApiKey = secrets.TOMORROWIO_API_KEY;"
            "const openweatherApiKey = secrets.OPEN_WEATHER_API_KEY;"
            "const location = localArgs[0];"
            "const threshold = localArgs[1];"
            
            // Tomorrow.io API call
            "const tomorrowioResponse = await Functions.makeHttpRequest({"
            "  url: `https://api.tomorrow.io/v4/weather/history/recent?location=${location}&apikey=${tomorrowioApiKey}`,"
            "  headers: { 'accept': 'application/json' }"
            "});"

            // OpenWeatherMap API call
            "const openWeatherResponse = await Functions.makeHttpRequest({"
            "  url: `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${location.split(',')[0]}&lon=${location.split(',')[1]}&dt=${Math.floor(Date.now() / 1000) - 2592000}&appid=${openweatherApiKey}`,"
            "  headers: { 'Content-Type': 'application/json' }"
            "});"
            
            // Error handling
            "if (tomorrowioResponse.error || openWeatherResponse.error) {"
            "  throw Error('API call failed');"
            "}"
            
            // Parse responses
            "const tomorrowioData = tomorrowioResponse.data.timelines.daily[0].values.precipitationAccumulation;"
            "const openWeatherData = openWeatherResponse.data.hourly.reduce((sum, hour) => sum + hour.precipitation, 0);"
            
            // Validate drought condition (30-day cumulative rainfall < threshold)
            "const isDrought = (tomorrowioData < threshold) && (openWeatherData < threshold);"
            "return Functions.encodeString(isDrought.toString());";

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(jsSourceCode);
        
        // Set arguments: [location, rainfall threshold]
        string[] memory localArgs = new string[](2);
        localArgs[0] = policy.location;
        localArgs[1] = "50"; // 50mm threshold
        req.setArgs(localArgs);
        
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        
        pendingRequests[requestId] = true;
        requestToPolicy[requestId] = policyId;
        policy.isActive = false;
        
        emit RequestSent(requestId);
    }

    /**
     * @notice Chainlink Functions response callback
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        require(pendingRequests[requestId], "Invalid request");
        delete pendingRequests[requestId];
        
        bytes32 policyId = requestToPolicy[requestId];
        Policy storage policy = policies[policyId];
        
        if (err.length > 0) {
            emit RequestFulfilled(requestId, response, err);
            return;
        }
        
        bool conditionMet = abi.decode(response, (bool));
        
        if (conditionMet && !policy.claimed) {
            // Use InsurancePayout for secure payout
            payoutManager.processPayout(
                policy.farmer,
                policy.coverageAmount,
                policyId
            );
            
            policy.claimed = true;
            emit PayoutTriggered(policyId, policy.coverageAmount);
        }
        
        emit RequestFulfilled(requestId, response, err);
    }

    // Management functions
    function updatePayoutManager(address _payoutManager) external onlyOwner {
        payoutManager = InsurancePayout(_payoutManager);
    }

    function withdrawAKS(address recipient) external onlyOwner {
        uint256 balance = aks.balanceOf(address(this));
        aks.transfer(recipient, balance);
    }
}