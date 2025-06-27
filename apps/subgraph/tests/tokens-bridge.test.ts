import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { ChainSupportUpdated } from "../generated/schema"
import { ChainSupportUpdated as ChainSupportUpdatedEvent } from "../generated/TokensBridge/TokensBridge"
import { handleChainSupportUpdated } from "../src/tokens-bridge"
import { createChainSupportUpdatedEvent } from "./tokens-bridge-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let chainSelector = BigInt.fromI32(234)
    let supported = "boolean Not implemented"
    let newChainSupportUpdatedEvent = createChainSupportUpdatedEvent(
      chainSelector,
      supported
    )
    handleChainSupportUpdated(newChainSupportUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("ChainSupportUpdated created and stored", () => {
    assert.entityCount("ChainSupportUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ChainSupportUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "chainSelector",
      "234"
    )
    assert.fieldEquals(
      "ChainSupportUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "supported",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
