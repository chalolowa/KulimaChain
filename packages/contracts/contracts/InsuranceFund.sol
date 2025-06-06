// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./KulimaTokenManager.sol";

contract InsuranceFund is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    
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
    
    KulimaTokenManager public tokenManager;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public donID;
    
    // Events
    event PolicyCreated(bytes32 policyId, address indexed farmer);
    event PayoutTriggered(bytes32 policyId, uint256 amount);
    event RequestFulfilled(bytes32 requestId, bytes response, bytes err);

    constructor(
        address router,
        address _tokenManager,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        tokenManager = KulimaTokenManager(_tokenManager);
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        donID = _donID;
    }

    /**
     * @notice Creates a new insurance policy
     * @param farmer Farmer's wallet address
     * @param premium Premium amount in stablecoins
     * @param coverageAmount Payout amount if trigger condition met
     * @param duration Policy duration in seconds
     * @param location GPS coordinates "lat,lon"
     */
    function createPolicy(
        address farmer,
        uint256 premium,
        uint256 coverageAmount,
        uint256 duration,
        string memory location
    ) external {
        require(premium > 0, "Invalid premium");
        require(coverageAmount > premium, "Invalid coverage");
        
        // Transfer premium from farmer
        //premiumToken.transferFrom(msg.sender, address(this), premium);
        
        bytes32 policyId = keccak256(abi.encodePacked(farmer, block.timestamp));
        policies[policyId] = Policy({
            farmer: farmer,
            premium: premium,
            coverageAmount: coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + duration,
            location: location,
            isActive: true,
            claimed: false
        });
        
        emit PolicyCreated(policyId, farmer);
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
        string memory source = 
            "const tomorrowioApiKey = secrets.TOMORROWIO_API_KEY;"
            "const openweatherApiKey = secrets.OPEN_WEATHER_API_KEY;"
            "const location = args[0];"
            "const threshold = args[1];"
            
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
        req.initializeRequestForInlineJavaScript(source);
        
        // Set arguments: [location, rainfall threshold]
        string[] memory args = new string[](2);
        args[0] = policy.location;
        args[1] = "50"; // 50mm threshold
        req.setArgs(args);
        
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
            // Use Token Manager for secure payout
            tokenManager.processPayout(
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
    function updateTokenManager(address _tokenManager) external onlyOwner {
        tokenManager = KulimaTokenManager(_tokenManager);
    }
}