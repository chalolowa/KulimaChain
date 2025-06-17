const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getRouterConfig } = require("./chainConfig.js");

describe("TokensBridge", function () {
  let owner, user;
  let AKSToken, KFShares, TokensBridge;
  let aksToken, kfsToken, tokensBridge;
  let chainId, routerAddress, chainSelector;

  before(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Get chain config
    chainId = (await ethers.provider.getNetwork()).chainId;
    const config = getRouterConfig(chainId);
    routerAddress = config.router;
    chainSelector = config.chainSelector;
  });

  beforeEach(async function () {
    // Deploy AKS Token
    AKSToken = await ethers.getContractFactory("AKSToken");
    aksToken = await AKSToken.deploy();
    
    // Deploy KFS Master
    KFShares = await ethers.getContractFactory("KFShares");
    kfsToken = await KFShares.deploy();
    
    // Deploy AKSBridge
    AKSBridge = await ethers.getContractFactory("AKSBridge");
    aksBridge = await AKSBridge.deploy(
      routerAddress,
      aksToken.address,
      chainSelector
    );
    
    // Configure contracts
    await aksToken.setBridge(tokensBridge.address);
    await tokensBridge.setTokenSupport(aksToken.address, true);
    await tokensBridge.setTokenSupport(kfsToken.address, true);

    // Mint initial tokens
    await aksToken.mint(owner.address, ethers.utils.parseEther("1000"));
    await kfsToken.initialize(
      "Farm Shares",
      "KFS",
      ethers.utils.parseEther("10000"),
      aksToken.address,
      tokensBridge.address,
      owner.address
    );
  });

  it("Should deploy contracts correctly", async function () {
    expect(await aksToken.bridge()).to.equal(aksBridge.address);
    expect(await tokensBridge.aksToken()).to.equal(aksToken.address);
    expect(await tokensBridge.supportedTokens(aksToken.address)).to.be.true;
    expect(await tokensBridge.supportedTokens(kfsToken.address)).to.be.true;
  });

  it("Should transfer AKS tokens cross-chain", async function () {
    const amount = ethers.utils.parseEther("100");
    const destinationChain = 80001; // Polygon Mumbai
    
    // Set destination bridge (simulate)
    await tokensBridge.setDestinationBridge(destinationChain, "0xDestinationBridge");

    // Estimate fee
    const fee = await tokensBridge.getTransferFee(
      destinationChain,
      aksToken.address,
      user.address,
      amount
    );
    
    // Send tokens
    await aksToken.connect(owner).approve(tokensBridge.address, amount);
    await expect(
      tokensBridge.connect(owner).sendTokens(
        aksToken.address,
        destinationChain,
        user.address,
        amount,
        { value: fee }
      )
    ).to.emit(tokensBridge, "TokensSent");

    // Check balance burned
    expect(await aksToken.balanceOf(owner.address)).to.equal(
      ethers.utils.parseEther("900")
    );
  });

  it("Should transfer KFS tokens cross-chain", async function () {
    const amount = ethers.utils.parseEther("500");
    const destinationChain = 43113; // Avalanche Fuji
    
    // Set destination bridge (simulate)
    await tokensBridge.setDestinationBridge(destinationChain, "0xDestinationBridge");

    // Mint KFS to owner
    await kfsToken.mint(owner.address, amount);
    
    // Estimate fee
    const fee = await tokensBridge.getTransferFee(
      destinationChain,
      kfsToken.address,
      user.address,
      amount
    );
    
    // Send tokens
    await kfsToken.connect(owner).approve(tokensBridge.address, amount);
    await expect(
      tokensBridge.connect(owner).sendTokens(
        kfsToken.address,
        destinationChain,
        user.address,
        amount,
        { value: fee }
      )
    ).to.emit(tokensBridge, "TokensSent");

    // Check balance burned
    expect(await kfsToken.balanceOf(owner.address)).to.equal(0);
  });

  it("Should handle token receive (simulated)", async function () {
    const amount = ethers.utils.parseEther("200");
    const sourceChain = 80001; // Polygon Mumbai
    
    // Simulate CCIP receive
    const receiver = user.address;
    const data = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [aksToken.address, receiver, amount]
    );
    
    const message = {
      data: data,
      sourceChainSelector: sourceChain,
      sender: ethers.utils.defaultAbiCoder.encode(
        ["address"],
        ["0xDestinationBridge"]
      )
    };
    
    // Trigger receive
    await tokensBridge._ccipReceive(message);
    
    // Check balance minted
    expect(await aksToken.balanceOf(receiver)).to.equal(amount);
  });

  it("Should prevent unauthorized token transfers", async function () {
    const amount = ethers.utils.parseEther("100");
    const destinationChain = 421613; // Arbitrum Goerli
    
    // Attempt without token support
    await expect(
      aksBridge.connect(owner).sendTokens(
        user.address, // Invalid token
        destinationChain,
        user.address,
        amount,
        { value: ethers.utils.parseEther("0.1") }
      )
    ).to.be.revertedWith("Token not supported");
    
    // Attempt without destination bridge
    await expect(
      tokensBridge.connect(owner).sendTokens(
        aksToken.address,
        destinationChain,
        user.address,
        amount,
        { value: ethers.utils.parseEther("0.1") }
      )
    ).to.be.revertedWith("Destination bridge not set");
  });

  it("Should allow owner to manage configuration", async function () {
    // Add new token
    await tokensBridge.setTokenSupport(user.address, true);
    expect(await tokensBridge.supportedTokens(user.address)).to.be.true;

    // Set token mapping
    await tokensBridge.setTokenMapping(
      80001, // Polygon
      aksToken.address,
      "0xAvalancheAKSAddress"
    );
    
    // Withdraw funds
    const balance = await ethers.provider.getBalance(tokensBridge.address);
    await expect(tokensBridge.withdraw(owner.address))
      .to.changeEtherBalance(owner, balance);
  });
});