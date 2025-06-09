const axios = require("axios");
const ethers = require("ethers");

module.exports = async (request, response) => {
  try {
    const apiResponse = await axios.get(
      "https://v6.exchangerate-api.com/v6/f316e94d3b94607a42048050/latest/USD"
    );

    const kesRate = apiResponse.data.conversion_rates.KES;
    const scaledRate = Math.round(kesRate * 1e8); // Scale to 8 decimals

    // Return as uint256 (32-byte hex)
    response
      .status(200)
      .send(
        ethers.utils.hexZeroPad(
          ethers.BigNumber.from(scaledRate).toHexString(),
          32
        )
      );
  } catch (error) {
    console.error("API Error:", error);
    response.status(500).send("API_ERROR");
  }
};
