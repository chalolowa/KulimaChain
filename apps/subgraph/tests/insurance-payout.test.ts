import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { FarmerPayout } from "../generated/schema"
import { FarmerPayout as FarmerPayoutEvent } from "../generated/InsurancePayout/InsurancePayout"
import { handleFarmerPayout } from "../src/insurance-payout"
import { createFarmerPayoutEvent } from "./insurance-payout-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let farmer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let amount = BigInt.fromI32(234)
    let policyId = Bytes.fromI32(1234567890)
    let newFarmerPayoutEvent = createFarmerPayoutEvent(farmer, amount, policyId)
    handleFarmerPayout(newFarmerPayoutEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("FarmerPayout created and stored", () => {
    assert.entityCount("FarmerPayout", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FarmerPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "farmer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "FarmerPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )
    assert.fieldEquals(
      "FarmerPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "policyId",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
