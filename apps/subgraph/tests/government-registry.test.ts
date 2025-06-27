import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { AuthorityAdded } from "../generated/schema"
import { AuthorityAdded as AuthorityAddedEvent } from "../generated/GovernmentRegistry/GovernmentRegistry"
import { handleAuthorityAdded } from "../src/government-registry"
import { createAuthorityAddedEvent } from "./government-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let authority = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let name = "Example string value"
    let jurisdiction = "Example string value"
    let newAuthorityAddedEvent = createAuthorityAddedEvent(
      authority,
      name,
      jurisdiction
    )
    handleAuthorityAdded(newAuthorityAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AuthorityAdded created and stored", () => {
    assert.entityCount("AuthorityAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AuthorityAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "authority",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AuthorityAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "AuthorityAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "jurisdiction",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
