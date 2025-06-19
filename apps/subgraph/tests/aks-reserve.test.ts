import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { AuditorAdded } from "../generated/schema"
import { AuditorAdded as AuditorAddedEvent } from "../generated/AKSReserve/AKSReserve"
import { handleAuditorAdded } from "../src/aks-reserve"
import { createAuditorAddedEvent } from "./aks-reserve-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let auditor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAuditorAddedEvent = createAuditorAddedEvent(auditor)
    handleAuditorAdded(newAuditorAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AuditorAdded created and stored", () => {
    assert.entityCount("AuditorAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AuditorAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "auditor",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
