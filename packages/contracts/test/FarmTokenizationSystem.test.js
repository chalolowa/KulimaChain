const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getRouterConfig } = require("./chainConfig.js");

describe("Farm Tokenization System", function () {
  let deployer, farmer, investor, authority;
  let FarmToken, FractionalizationProxy, AKSToken, KFShares;
  let farmToken, proxy, aksToken;
  
  // Farm details
  const farmDetails = {
    geoLocation: "12.345,67.890",
    sizeHectares: ethers.utils.parseUnits("10", 18), // 10 hectares
    proposedValuation: ethers.utils.parseEther("50000"),
    titleDeedCID: "QmXyZ123...",
    titleDeedHash: ethers.utils.id("TitleDeed123"),
    authorityValuation: ethers.utils.parseEther("45000")
  };
  
  before(async function () {
    [deployer, farmer, investor, authority] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy AKS Token
    AKSToken = await ethers.getContractFactory("AKSToken");
    aksToken = await AKSToken.deploy();
    
    // Deploy KFShares Implementation
    KFShares = await ethers.getContractFactory("KFShares");
    const kfsImplementation = await KFShares.deploy();
    
    // Deploy FarmToken
    FarmToken = await ethers.getContractFactory("FarmToken");
    farmToken = await FarmToken.deploy(
      deployer.address,
      authority.address // Land registry authority
    );
    
    // Get CCIP config
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const routerConfig = getRouterConfig(chainId);
    
    // Deploy FractionalizationProxy
    FractionalizationProxy = await ethers.getContractFactory("FractionalizationProxy");
    proxy = await FractionalizationProxy.deploy(
      deployer.address,
      authority.address,
      aksToken.address,
      kfsImplementation.address,
      deployer.address, // Community vault
      routerConfig.router
    );
    
    // Configure system
    await farmToken.grantRole(await farmToken.MINTER_ROLE(), proxy.address);
    await aksToken.mint(farmer.address, ethers.utils.parseEther("100000"));
    await aksToken.mint(investor.address, ethers.utils.parseEther("50000"));
  });

  it("Should deploy contracts correctly", async function () {
    expect(await farmToken.landRegistryAuthority()).to.equal(authority.address);
    expect(await proxy.aksToken()).to.equal(aksToken.address);
    expect(await farmToken.hasRole(await farmToken.MINTER_ROLE(), proxy.address)).to.be.true;
  });

  it("Should tokenize a farm", async function () {
    // Create authority signature
    const message = ethers.utils.solidityPack(
      ["address", "string", "uint256", "string", "bytes32", "uint256", "uint256"],
      [
        farmer.address,
        farmDetails.geoLocation,
        farmDetails.sizeHectares,
        farmDetails.titleDeedCID,
        farmDetails.titleDeedHash,
        farmDetails.proposedValuation,
        farmDetails.authorityValuation
      ]
    );
    const signature = await authority.signMessage(ethers.utils.arrayify(message));
    
    // Tokenize farm
    await expect(
      farmToken.connect(farmer).tokenizeFarmWithDeed(
        farmer.address,
        farmDetails.geoLocation,
        farmDetails.sizeHectares,
        farmDetails.proposedValuation,
        farmDetails.titleDeedCID,
        farmDetails.titleDeedHash,
        signature,
        farmDetails.authorityValuation
      )
    ).to.emit(farmToken, "FarmTokenized");
    
    // Verify farm details
    const farmId = 1;
    const farm = await farmToken.farmDetails(farmId);
    expect(farm.owner).to.equal(farmer.address);
    expect(farm.valuation).to.equal(farmDetails.authorityValuation);
  });

  it("Should fractionalize a farm", async function () {
    // First tokenize a farm (simplified)
    await farmToken.connect(farmer).mint(farmer.address, 1, 1, "0x");
    
    // Fractionalize farm
    const totalArea = 10; // hectares
    const sharesPerHectare = 1000;
    const totalShares = totalArea * sharesPerHectare;
    
    await expect(
      proxy.connect(farmer).fractionalizeFarm(
        farmToken.address,
        1, // farmTokenId
        "Farm 1 Shares",
        "FARM1",
        totalArea,
        sharesPerHectare
      )
    ).to.emit(proxy, "FarmFractionalized");
    
    // Verify fractionalization
    const fractionalized = await proxy.fractionalizedFarms(1);
    expect(fractionalized.kfsToken).to.not.equal(ethers.constants.AddressZero);
    expect(fractionalized.totalShares).to.equal(totalShares);
    
    // Check share distribution
    const kfsToken = await ethers.getContractAt("KFShares", fractionalized.kfsToken);
    const farmerShares = await kfsToken.balanceOf(farmer.address);
    const vaultShares = await kfsToken.balanceOf(deployer.address); // community vault
    
    expect(farmerShares).to.equal(totalShares * 90 / 100);
    expect(vaultShares).to.equal(totalShares * 10 / 100);
  });

  it("Should allow partial investment", async function () {
    // Setup: Tokenize and fractionalize farm
    await farmToken.connect(farmer).mint(farmer.address, 1, 1, "0x");
    await proxy.connect(farmer).fractionalizeFarm(
      farmToken.address,
      1,
      "Farm 1 Shares",
      "FARM1",
      10, // hectares
      1000 // shares per hectare
    );
    
    const fractionalized = await proxy.fractionalizedFarms(1);
    const kfsToken = await ethers.getContractAt("KFShares", fractionalized.kfsToken);
    
    // Investor purchases shares for 2 hectares
    const sharesToBuy = 2000; // 2 * 1000
    const pricePerShare = ethers.utils.parseEther("1"); // 1 AKS per share
    await kfsToken.connect(farmer).updatePricingModel(pricePerShare);
    
    // Approve and purchase
    const totalCost = sharesToBuy * pricePerShare;
    await aksToken.connect(investor).approve(kfsToken.address, totalCost);
    
    await expect(
      kfsToken.connect(investor).purchaseShares(1, sharesToBuy)
    ).to.emit(proxy, "SharesBoughtBack");
    
    // Verify balances
    expect(await kfsToken.balanceOf(investor.address)).to.equal(sharesToBuy);
    expect(await aksToken.balanceOf(farmer.address)).to.equal(
      ethers.utils.parseEther("100000").add(totalCost)
    );
  });

  it("Should handle buyback process", async function () {
    // Setup: Tokenize, fractionalize, and sell some shares
    await farmToken.connect(farmer).mint(farmer.address, 1, 1, "0x");
    await proxy.connect(farmer).fractionalizeFarm(
      farmToken.address,
      1,
      "Farm 1 Shares",
      "FARM1",
      10, // hectares
      1000 // shares per hectare
    );
    
    const fractionalized = await proxy.fractionalizedFarms(1);
    const kfsToken = await ethers.getContractAt("KFShares", fractionalized.kfsToken);
    
    // Farmer creates buyback intent
    const pricePerShare = ethers.utils.parseEther("1.5");
    await expect(
      proxy.connect(farmer).createBuybackIntent(1, pricePerShare)
    ).to.emit(proxy, "BuybackIntentCreated");
    
    // Investor sells back shares
    const sharesToSell = 500;
    await kfsToken.connect(investor).transfer(investor.address, sharesToSell);
    await kfsToken.connect(investor).approve(proxy.address, sharesToSell);
    
    await expect(
      proxy.connect(investor).sellToBuyback(1, sharesToSell)
    ).to.emit(proxy, "SharesBoughtBack");
  });

  it("Should prevent unauthorized actions", async function () {
    await farmToken.connect(farmer).mint(farmer.address, 1, 1, "0x");
    
    // Non-owner trying to fractionalize
    await expect(
      proxy.connect(investor).fractionalizeFarm(
        farmToken.address,
        1,
        "Farm 1",
        "FARM1",
        10,
        1000
      )
    ).to.be.reverted;
    
    // Fractionalize properly
    await proxy.connect(farmer).fractionalizeFarm(
      farmToken.address,
      1,
      "Farm 1",
      "FARM1",
      10,
      1000
    );
    
    // Non-owner trying to create buyback
    await expect(
      proxy.connect(investor).createBuybackIntent(1, ethers.utils.parseEther("1"))
    ).to.be.revertedWith("Not original owner");
  });

  it("Should handle cross-chain transfers", async function () {
    // This would be a simulation in unit tests
    // Actual CCIP integration would require forking or local setup
    // We'll just verify the function calls
    
    await farmToken.connect(farmer).mint(farmer.address, 1, 1, "0x");
    await proxy.connect(farmer).fractionalizeFarm(
      farmToken.address,
      1,
      "Farm 1",
      "FARM1",
      10,
      1000
    );
    
    const fractionalized = await proxy.fractionalizedFarms(1);
    const kfsToken = await ethers.getContractAt("KFShares", fractionalized.kfsToken);
    
    // Mint shares to investor
    await kfsToken.mint(investor.address, 1000);
    
    // Attempt cross-chain transfer (simulated)
    await expect(
      kfsToken.connect(investor).transferCrossChain(
        80001, // Polygon chain selector
        investor.address,
        500,
        { value: ethers.utils.parseEther("0.1") }
      )
    ).to.emit(kfsToken, "Transfer");
  });
});