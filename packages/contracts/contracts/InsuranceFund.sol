// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InsuranceFund is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    struct Policy {
        address farmer;
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        string location; // GPS coordinates
        bool isActive;
        bool claimed;
    }

    mapping(bytes32 => Policy) public policies;
    mapping(bytes32 => bool) public pendingRequests;
    mapping(bytes32 => bytes32) public requestToPolicy;
    mapping(address => uint256) public farmerBalances;

    IERC20 public immutable premiumToken;
    IERC20 public immutable payoutToken;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    bytes32 public donID;
    
    // Events
    event PolicyCreated(bytes32 policyId, address indexed farmer);
    event PayoutTriggered(bytes32 policyId, uint256 amount);
    event RequestSent(bytes32 requestId);
    event RequestFulfilled(bytes32 requestId, bytes response, bytes err);
    event FundsDeposited(address indexed sender, uint256 amount);
    event FundsWithdrawn(address indexed farmer, uint256 amount);

    constructor(
        address router,
        address _premiumToken,
        address _payoutToken,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        premiumToken = IERC20(_premiumToken);
        payoutToken = IERC20(_payoutToken);
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
        premiumToken.transferFrom(msg.sender, address(this), premium);
        
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
     * @notice Triggers insurance payout evaluation
     * @param policyId Policy ID to evaluate
     */
    function evaluatePolicy(bytes32 policyId) external onlyOwner {
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
            // Handle error (log, retry, etc.)
            emit RequestFulfilled(requestId, response, err);
            return;
        }
        
        // Decode response: "true" or "false"
        bool conditionMet = keccak256(response) == keccak256(abi.encodePacked("true"));
        
        if (conditionMet && !policy.claimed) {
            payoutToken.transfer(policy.farmer, policy.coverageAmount);
            policy.claimed = true;
            emit PayoutTriggered(policyId, policy.coverageAmount);
        }
        
        emit RequestFulfilled(requestId, response, err);
    }

    /**
     * @notice Allows farmers to withdraw claim payouts
     */
    function withdrawPayout() external {
        uint256 amount = farmerBalances[msg.sender];
        require(amount > 0, "No balance");
        
        farmerBalances[msg.sender] = 0;
        payoutToken.transfer(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    // Management functions
    function updateSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    function depositStablecoins(uint256 amount) external {
        payoutToken.transferFrom(msg.sender, address(this), amount);
        emit FundsDeposited(msg.sender, amount);
    }
}